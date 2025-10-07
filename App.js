import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, Pressable, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons'; // For icons

// State management for tickets and form
const App = () => {
  const [tickets, setTickets] = useState([
    { id: 1, title: 'Issue 1', description: 'First sample issue', status: 'Created', rating: null },
    { id: 2, title: 'Issue 2', description: 'Second sample issue', status: 'Under Assistance', rating: null },
    { id: 3, title: 'Issue 3', description: 'Third sample issue', status: 'Completed', rating: 3 },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Created');
  const [rating, setRating] = useState(0);
  const [editingId, setEditingId] = useState(null);

  // Handle saving ticket data with rating confirmation
  const handleSave = () => {
    if (title && description) {
      const newRating = status === 'Completed' ? rating : null;
      if (editingId && newRating !== tickets.find(t => t.id === editingId).rating) {
        Alert.alert('Rating Updated', 'Are you sure?', [
          { text: 'Cancel', onPress: () => {}, style: 'cancel' },
          { text: 'Yes', onPress: () => {
            if (editingId) {
              setTickets(tickets.map(t => t.id === editingId ? { ...t, title, description, status, rating: newRating } : t));
            } else {
              setTickets([...tickets, { id: Date.now(), title, description, status, rating: newRating }]);
            }
            resetForm();
          }},
        ]);
        return;
      }
      if (editingId) {
        setTickets(tickets.map(t => t.id === editingId ? { ...t, title, description, status, rating: newRating } : t));
      } else {
        setTickets([...tickets, { id: Date.now(), title, description, status, rating: newRating }]);
      }
      resetForm();
    }
  };

  // Reset form fields after save or cancel
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('Created');
    setRating(0);
    setEditingId(null);
    setModalVisible(false);
  };

  // Delete a ticket by ID
  const handleDelete = (id) => {
    setTickets(tickets.filter(t => t.id !== id));
  };

  // TicketItem component to render each ticket
  const TicketItem = ({ ticket }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'Created': return '#3498db';
        case 'Under Assistance': return '#e67e22';
        case 'Completed': return '#2ecc71';
        default: return '#ecf0f1';
      }
    };

    const getBackgroundColor = () => {
      return ticket.status === 'Completed' && ticket.rating ? '#34495e' : '#2c3e50';
    };

    return (
      <Pressable style={({ pressed }) => [
        styles.ticketItem,
        { backgroundColor: getBackgroundColor(), elevation: pressed ? 8 : 6 },
      ]}>
        <Text style={styles.ticketTitle}>{ticket.title}</Text>
        <Text style={[styles.ticketStatus, { color: getStatusColor(ticket.status) }]}>
          Status: {ticket.status}
        </Text>
        {ticket.status === 'Completed' && ticket.rating && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>Rating:</Text>
            {[1, 2, 3, 4, 5].map((star) => (
              <Text key={star} style={[styles.star, { color: star <= ticket.rating ? 'gold' : '#bdc3c7' }]}>★</Text>
            ))}
          </View>
        )}
        <View style={styles.actions}>
          <Pressable onPress={() => { 
            setEditingId(ticket.id); 
            setTitle(ticket.title); 
            setDescription(ticket.description); 
            setStatus(ticket.status); 
            setRating(ticket.rating || 0); 
            setModalVisible(true); 
          }}>
            <Ionicons name="pencil" size={22} color="#3498db" />
          </Pressable>
          <Pressable onPress={() => handleDelete(ticket.id)}>
            <Ionicons name="trash" size={22} color="#e74c3c" />
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ticket Tracker</Text>
        <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>Add New Ticket</Text>
        </Pressable>
      </View>
      <FlatList
        data={tickets}
        renderItem={({ item }) => <TicketItem ticket={item} />}
        keyExtractor={item => item.id.toString()}
        style={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No tickets yet.</Text>}
      />
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={resetForm}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{editingId ? 'Edit Ticket' : 'Add New Ticket'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <Picker
            selectedValue={status}
            style={styles.picker}
            onValueChange={setStatus}
          >
            <Picker.Item label="Created" value="Created" />
            <Picker.Item label="Under Assistance" value="Under Assistance" />
            <Picker.Item label="Completed" value="Completed" />
          </Picker>
          {status === 'Completed' && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>Rating:</Text>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Text style={[styles.star, { color: star <= rating ? 'gold' : '#bdc3c7' }]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View style={styles.modalButtons}>
            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={resetForm}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50', // Dark theme background
  },
  header: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#34495e', // Darker header
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ecf0f1', // Light text for contrast
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  list: {
    padding: 10,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
    color: '#bdc3c7', // Lighter gray for empty state
    fontSize: 16,
  },
  ticketItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#34495e',
    elevation: 6,
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ecf0f1',
  },
  ticketStatus: {
    fontSize: 14,
    marginTop: 5,
    fontWeight: '500',
  },
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#3498db', // Strong blue for visibility
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  modalView: {
    margin: 20,
    backgroundColor: '#34495e',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    marginTop: 100,
    flex: 1,
    justifyContent: 'center',
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#ecf0f1',
  },
  input: {
    height: 45,
    borderColor: '#465c71',
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    width: 280,
    borderRadius: 10,
    backgroundColor: '#2c3e50',
    color: '#ecf0f1',
    fontSize: 16,
  },
  picker: {
    height: 50,
    width: 280,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#2c3e50',
    color: '#ecf0f1',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingText: {
    fontSize: 16,
    marginRight: 10,
    color: '#ecf0f1',
    fontWeight: '500',
  },
  star: {
    fontSize: 22,
    marginHorizontal: 3,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 15,
    backgroundColor: '#2ecc71', // Bright green for visibility
    marginRight: 5,
    elevation: 5,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 15,
    backgroundColor: '#e74c3c', // Bright red for visibility
    marginLeft: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
});

export default App;
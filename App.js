import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  StatusBar,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native';

// TicketItem Component - Displays individual tickets
const TicketItem = ({ ticket, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Created':
        return 'rgba(0, 122, 255, 0.85)';
      case 'Under Assistance':
        return 'rgba(255, 149, 0, 0.85)';
      case 'Completed':
        return 'rgba(52, 199, 89, 0.85)';
      default:
        return 'rgba(142, 142, 147, 0.85)';
    }
  };

  const renderStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text key={star} style={styles.star}>
            {star <= rating ? '★' : '☆'}
          </Text>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.ticketCard}>
      <View style={styles.ticketCardInner}>
        <View style={styles.ticketHeader}>
          <View style={styles.ticketTitleRow}>
            <Text style={styles.ticketTitle}>{ticket.title}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(ticket.status) },
              ]}
            >
              <Text style={styles.statusText}>{ticket.status}</Text>
            </View>
          </View>
          <Text style={styles.ticketDescription}>{ticket.description}</Text>
        </View>

        {ticket.status === 'Completed' && ticket.rating > 0 && (
          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Rating:</Text>
            {renderStars(ticket.rating)}
          </View>
        )}

        <View style={styles.ticketActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => onEdit(ticket)}
          >
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => onDelete(ticket.id)}
          >
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Main App Component
const App = () => {
  const [tickets, setTickets] = useState([
    {
      id: 1,
      title: 'Sample Ticket',
      description: 'This is a sample ticket to get you started',
      status: 'Created',
      rating: 0,
    },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Created',
    rating: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  // Open modal for creating or editing a ticket
  const openModal = (ticket = null) => {
    if (ticket) {
      setEditingTicket(ticket);
      setFormData(ticket);
    } else {
      setEditingTicket(null);
      setFormData({
        title: '',
        description: '',
        status: 'Created',
        rating: 0,
      });
    }
    setModalVisible(true);
  };

  // Close modal and reset form
  const closeModal = () => {
    setModalVisible(false);
    setEditingTicket(null);
    setFormData({
      title: '',
      description: '',
      status: 'Created',
      rating: 0,
    });
  };

  // Save or update ticket
  const handleSave = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      Alert.alert('Missing Information', 'Please fill in all fields', [
        { text: 'OK', style: 'default' },
      ]);
      return;
    }

    if (editingTicket) {
      setTickets(
        tickets.map((t) =>
          t.id === editingTicket.id ? { ...formData, id: t.id } : t
        )
      );
      closeModal();
      Alert.alert('Success', 'Ticket edited successfully', [
        { text: 'OK', style: 'default' },
      ]);
    } else {
      const newTicket = {
        ...formData,
        status: 'Created',
        rating: 0,
        id: Date.now(),
      };
      setTickets([...tickets, newTicket]);
      closeModal();
      Alert.alert('Success', 'New ticket created', [
        { text: 'OK', style: 'default' },
      ]);
    }
  };

  // Delete ticket with confirmation
  const handleDelete = (id) => {
    Alert.alert(
      'Delete Ticket',
      'Are you sure you want to delete this ticket? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setTickets(tickets.filter((t) => t.id !== id));
            Alert.alert('Deleted', 'Ticket deleted successfully', [
              { text: 'OK', style: 'default' },
            ]);
          },
        },
      ]
    );
  };

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Refreshed', 'Ticket list refreshed', [
        { text: 'OK', style: 'default' },
      ]);
    }, 1000);
  }, []);

  // Render rating stars in the modal
  const renderRatingStars = () => {
    return (
      <View style={styles.ratingInputContainer}>
        <Text style={styles.modalLabel}>Rating (for Completed tickets)</Text>
        <View style={styles.starsInputWrapper}>
          <View style={styles.starsInputRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setFormData({ ...formData, rating: star })}
                disabled={formData.status !== 'Completed'}
              >
                <Text
                  style={[
                    styles.starInput,
                    formData.status !== 'Completed' && styles.starDisabled,
                  ]}
                >
                  {star <= formData.rating ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  // Memoized renderItem function
  const renderItem = useCallback(
    ({ item }) => (
      <TicketItem
        ticket={item}
        onEdit={openModal}
        onDelete={handleDelete}
      />
    ),
    [openModal, handleDelete]
  );

  // Item layout for FlatList optimization
  const getItemLayout = (data, index) => ({
    length: 200, // Approximate height of each ticket item
    offset: 200 * index,
    index,
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={styles.backgroundGradient} />
      
      <View style={styles.header}>
        <View style={styles.headerGlass}>
          <Text style={styles.headerTitle}>Ticket Tracker</Text>
          <Text style={styles.headerSubtitle}>
            Manage your support tickets
          </Text>
        </View>
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={21}
        removeClippedSubviews={true}
        getItemLayout={getItemLayout}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
            colors={['#60A5FA']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyGlass}>
              <Text style={styles.emptyText}>No tickets yet</Text>
              <Text style={styles.emptySubtext}>
                Pull to refresh or create your first ticket to get started
              </Text>
            </View>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => openModal()}
        activeOpacity={0.8}
      >
        <View style={styles.addButtonGlass}>
          <Text style={styles.addButtonText}>✨ Add New Ticket</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalContentGlass}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={closeModal} style={styles.modalCancelButton}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>
                  {editingTicket ? 'Edit Ticket' : 'New Ticket'}
                </Text>
                <TouchableOpacity onPress={handleSave} style={styles.modalSaveButton}>
                  <Text style={styles.modalSaveText}>
                    {editingTicket ? 'Save' : 'Add'}
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView 
                showsVerticalScrollIndicator={false} 
                style={styles.modalBody}
                bounces={true}
                scrollEnabled={true}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.inputGroup}>
                  <Text style={styles.modalLabel}>Title</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter ticket title"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      value={formData.title}
                      onChangeText={(text) =>
                        setFormData({ ...formData, title: text })
                      }
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.modalLabel}>Description</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Enter ticket description"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      value={formData.description}
                      onChangeText={(text) =>
                        setFormData({ ...formData, description: text })
                      }
                      multiline
                      numberOfLines={4}
                    />
                  </View>
                </View>

                {editingTicket && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.modalLabel}>Status</Text>
                      <View style={styles.statusPicker}>
                        {['Created', 'Under Assistance', 'Completed'].map((status) => (
                          <TouchableOpacity
                            key={status}
                            style={[
                              styles.statusOption,
                              formData.status === status && styles.statusOptionActive,
                            ]}
                            onPress={() => setFormData({ ...formData, status })}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.statusOptionText,
                                formData.status === status &&
                                  styles.statusOptionTextActive,
                              ]}
                            >
                              {status}
                            </Text>
                            {formData.status === status && (
                              <Text style={styles.checkmark}>✓</Text>
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {renderRatingStars()}
                  </>
                )}

                {!editingTicket && (
                  <View style={styles.infoBox}>
                    <View style={styles.infoBoxGlass}>
                      <Text style={styles.infoText}>
                        New tickets will be created with "Created" status. You can change the status when editing.
                      </Text>
                    </View>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
    backgroundColor: '#1E3A8A',
    opacity: 0.6,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 40,
    marginBottom: 10,
  },
  headerGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(20px)',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.374,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    letterSpacing: -0.08,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  ticketCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    height: 200, // Fixed height for getItemLayout optimization
  },
  ticketCardInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(30px)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    flex: 1,
  },
  ticketHeader: {
    marginBottom: 16,
  },
  ticketTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ticketTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
    letterSpacing: -0.408,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ticketDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
    fontWeight: '400',
    letterSpacing: -0.24,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  ratingLabel: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 8,
    letterSpacing: -0.24,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 18,
    color: '#FFD700',
    marginRight: 2,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  ticketActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  editButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  addButtonGlass: {
    backgroundColor: 'rgba(0, 122, 255, 0.85)',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(20px)',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(20px)',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.352,
  },
  emptySubtext: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: -0.24,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(10px)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '90%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    flex: 1,
  },
  modalContentGlass: {
    backgroundColor: 'rgba(20, 30, 60, 0.95)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(40px)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalCancelButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    minWidth: 60,
  },
  modalCancelText: {
    fontSize: 17,
    color: '#60A5FA',
    fontWeight: '500',
    letterSpacing: -0.408,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  modalSaveButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    minWidth: 60,
    alignItems: 'flex-end',
  },
  modalSaveText: {
    fontSize: 17,
    color: '#60A5FA',
    fontWeight: '700',
    letterSpacing: -0.408,
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(20px)',
  },
  input: {
    padding: 16,
    fontSize: 17,
    color: '#FFFFFF',
    letterSpacing: -0.408,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  statusPicker: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(20px)',
  },
  statusOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusOptionActive: {
    backgroundColor: 'rgba(96, 165, 250, 0.3)',
  },
  statusOptionText: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    letterSpacing: -0.408,
  },
  statusOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  checkmark: {
    fontSize: 18,
    color: '#60A5FA',
    fontWeight: '700',
  },
  ratingInputContainer: {
    marginTop: 8,
  },
  starsInputWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(20px)',
  },
  starsInputRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    justifyContent: 'center',
  },
  starInput: {
    fontSize: 40,
    color: '#FFD700',
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  starDisabled: {
    opacity: 0.3,
  },
  infoBox: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoBoxGlass: {
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
    backdropFilter: 'blur(20px)',
  },
  infoText: {
    fontSize: 14,
    color: '#93C5FD',
    lineHeight: 20,
    letterSpacing: -0.24,
    fontWeight: '500',
  },
});

export default App;
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { db } from '../config/firebase';
import { collection, addDoc, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';

interface Todo {
  id: string;
  text: string;
  createdAt: Date;
}

const FirebaseExample = () => {
  const { user, signIn, signUp, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [todoText, setTodoText] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);

  // Subscribe to todos collection
  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'todos'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const todoList: Todo[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          todoList.push({
            id: doc.id,
            text: data.text,
            createdAt: data.createdAt?.toDate() || new Date(),
          });
        });
        setTodos(todoList);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await signIn(email, password);
      Alert.alert('Success', 'Signed in successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    try {
      setLoading(true);
      await signUp(email, password);
      Alert.alert('Success', 'Account created successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert('Success', 'Logged out successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to log out');
    }
  };

  const addTodo = async () => {
    if (!todoText.trim() || !user) return;

    try {
      await addDoc(collection(db, 'todos'), {
        text: todoText,
        userId: user.uid,
        createdAt: new Date(),
      });
      setTodoText('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add todo');
    }
  };

  return (
    <View style={styles.container}>
      {!user ? (
        <View style={styles.authContainer}>
          <Text style={styles.title}>Firebase Authentication</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <View style={styles.buttonContainer}>
            <Button title="Sign In" onPress={handleSignIn} disabled={loading} />
            <Button title="Sign Up" onPress={handleSignUp} disabled={loading} />
          </View>
        </View>
      ) : (
        <View style={styles.todoContainer}>
          <Text style={styles.title}>Welcome, {user.email}</Text>
          <Button title="Logout" onPress={handleLogout} />
          
          <View style={styles.addTodoContainer}>
            <TextInput
              style={styles.todoInput}
              placeholder="Add a new todo"
              value={todoText}
              onChangeText={setTodoText}
            />
            <Button title="Add" onPress={addTodo} />
          </View>
          
          <Text style={styles.subtitle}>Your Todos:</Text>
          <FlatList
            data={todos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.todoItem}>
                <Text>{item.text}</Text>
                <Text style={styles.todoDate}>
                  {item.createdAt.toLocaleDateString()}
                </Text>
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  authContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  todoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  addTodoContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
  },
  todoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  todoItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  todoDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
});

export default FirebaseExample; 
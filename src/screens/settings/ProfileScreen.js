import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import FontSize from "../../constants/FontSize";
import { auth } from "../../../firebase";
import {
  getDatabase,
  ref,
  onValue,
} from "firebase/database";

const ProfileScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  
  // Fetch user data from the database
  const fetchUserData = () => {
    const user = auth.currentUser;
    if (user) {
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        setName(data.name);
        setEmail(data.email);
      });
    }
  };

  // Get initials from the name
  const getInitials = (name) => {
    const names = name.split(" ");
    const initials = names.map((n) => n.charAt(0).toUpperCase()).join("");
    return initials;
  };

    // Generate avatar based on the name initials
  const generateAvatar = (name) => {
    const initials = getInitials(name);
    const avatarStyle = {
      backgroundColor: Colors.primary,
    };
    return (
      <View style={[styles.avatar, avatarStyle]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
    );
  };
  // Handle navigation to the EditProfileScreen
  const handleEditProfile = () => {
    navigation.navigate("EditProfileScreen");
  };

  // Perform layout-related side effects before the browser paints
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Ionicons name="create-outline" size={24} color="#282534" style={styles.optionRight} />
        </TouchableOpacity>
      ),
      headerTitleStyle: { color: "#282534" },
      headerTintColor: "#282534",
    });
  }, [navigation]);

  return (
    <View style={styles.container}>

      <View style={styles.avatarContainer}>
        {generateAvatar(name)}
        <Text style={styles.name}>{name}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.infoLabel}>Name</Text>
        <Text style={styles.infoValue}>{name}</Text>
        <Text style={styles.infoLabel}>Email</Text>
        <Text style={styles.infoValue}>{email}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: 'white',
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 60,
    fontWeight: "bold",
    color: "#fff",
  },
  name: {
    fontSize: FontSize.xLarge,
    fontWeight: "bold",
    marginTop: 10,
  },
  form: {
    width: "90%",
  },
  label: {
    marginTop: 20,
  },
  infoContainer: {
    marginTop: 20,
  },
  infoLabel: {
    fontWeight: "bold",
    marginTop: 15,
    fontSize: FontSize.large,
  },
  infoValue: {
    marginTop: 5,
    fontSize: FontSize.medium,

  },
  editButton: {
    marginRight: 10,
  },
  optionRight: {
    marginRight: 10, 
  },
});

export default ProfileScreen;

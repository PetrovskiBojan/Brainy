import React, { useEffect } from "react";
import { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  BackHandler,
  StyleSheet,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/Colors";
import FontSize from "../constants/FontSize";
import Spacing from "../constants/Spacing";
import AppTextInput from "../../components/AppTextInput";
import { auth } from "../../firebase";
import NotificationsScreen from "./NotificationsScreen";
import ResetPasswordScreen from "./ResetPasswordScreen";

const { width, height } = Dimensions.get("window");

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigation.navigate("ChatScreen");
      }
    });
    return unsubscribe;
  }, []);

  const handleLogin = () => {
    auth
      .signInWithEmailAndPassword(email, password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        console.log(user.email);
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  const handleResetPassword = () => {
    navigation.navigate("ResetPasswordScreen");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
      <StatusBar backgroundColor={Colors.white} />
      <View style={{ padding: Spacing * 2 }}>
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              fontSize: FontSize.xLarge,
              color: Colors.primary,
              fontWeight: "bold",
              marginVertical: Spacing * 3,
            }}
          >
            Login here
          </Text>
          <Text
            style={{
              fontSize: FontSize.large,
              maxWidth: "60%",
              textAlign: "center",
            }}
          >
            Happy to see you again! Please login first.
          </Text>
        </View>
        <View style={{ marginVertical: Spacing * 3 }}>
          <AppTextInput
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
          ></AppTextInput>

          <AppTextInput
            placeholder="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry
          ></AppTextInput>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
          <Text style={styles.buttonText}> Forgot your password? </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleLogin}
          style={{
            padding: Spacing * 2,
            backgroundColor: Colors.primary,
            marginVertical: Spacing * 3,
            borderRadius: Spacing,
            shadowColor: Colors.primary,
            shadowOffset: {
              width: 0,
              height: Spacing,
            },
            shadowOpacity: 0.1,
            shadowRadius: Spacing,
          }}
        >
          <Text
            style={{
              color: Colors.onPrimary,
              textAlign: "center",
              fontSize: FontSize.large,
            }}
          >
            Sing in
          </Text>
        </TouchableOpacity>
        <Text
          style={{
            color: Colors.black,
            textAlign: "center",
            fontSize: FontSize.small,
          }}
        >
          Don't have an account yet?
        </Text>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.accBtn}
            onPress={() => navigation.navigate("RegisterScreen")}
          >
            <Text style={styles.buttonText}>Create new account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.primary, // Adjust the color to your preference
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: Colors.primary, // Adjust the color to your preference
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  accBtn: {
    width: "50%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.primary, // Adjust the color to your preference
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
});

export default Login;

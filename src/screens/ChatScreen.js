import { View, StyleSheet, Dimensions, AppState } from "react-native";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { GiftedChat, Send } from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../../firebase";
import { getDatabase, ref, update, onValue } from "firebase/database";
import logo from "../images/logo-white.png";

export default function ChatScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState(null);
  const [name, setName] = useState("");

  const { bottom } = useSafeAreaInsets();

  const messagesRef = useRef([]);

  // Fetching environment variables
  const appEnv = process.env.APP_ENV;
  const apiKey = process.env.API_KEY;
  const apiURL = "https://api.openai.com/v1/chat/completions";
  const apiYoutube = process.env.API_YOUTUBE;

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.currentState);
  const [videoDetails, setVideoDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const videoIds = [
    "Kvoq4luIYVc",
    "StLUjMxHZZE",
    "dJxnU9sOh6Q",
    "3xR8ZKVALwo",
    "iyIxRIWl5SI",
    "YAzTIOy0ID0",
  ];

  useEffect(() => {
    const unKeyboardDidShow = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    fetchUserData();
    return () => {
      unKeyboardDidShow.remove();
    };
  }, []);

  // Fetch user data from Firebase
  const fetchUserData = () => {
    // Function to fetch user data
    const user = auth.currentUser;
    if (user) {
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);
      onValue(
        userRef,
        (snapshot) => {
          const data = snapshot.val();
          setName(data.name);
          setUserData(data);
          greetingMessage(data); // Pass user data to the greetingMessage function
          fetchYoutubeVideoDetails(videoIds);
        },
        (errorObject) => {
          console.log("The read failed: " + errorObject.name);
        }
      );
    }
  };

  // Fetch YouTube video details
  const fetchYoutubeVideoDetails = async (videoIds) => {
    setIsLoading(true); // Set loading state on when fetching data
    const api = apiYoutube;
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoIds.join(
      ","
    )}&key=${api}&part=snippet,contentDetails,statistics,status`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      setVideoDetails(data.items); // Store the fetched video details in the state
      setIsLoading(false); // Set loading state off when data is fetched
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Greeting message for the user
  const greetingMessage = async (summary) => {
    if (summary.lastConversationSummary != null) {
      // Greet user based on the last conversation summary
      console.log("Summary:" + summary.lastConversationSummary);

      const apiRequestBody = {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a highly empathetic and professional psychologist/terapist. Your primary role is to help users manage their emotions, stress, 
        and mental health issues. You are adept at asking insightful and thought-provoking questions to encourage users to explore 
        their feelings and behaviors. Help them and provide them solution for their problems. Also suggest some great resources for yoga, fitness, relaxation, and motivation. Please let them know that you have resources also appropriate to the user's need.`,
          },
          {
            role: "system",
            content: `Here are some potential resources you can offer to the user. Please recommend these resources as appropriate to the user's needs. Yoga exercises: Search 'Yoga with Adriene' this channel: https://www.youtube.com/@yogawithadriene,'Yoga with Kassandra' this channel : https://www.youtube.com/@yogawithkassandra or 'Yoga with MadyMorris ' this channel: https://www.youtube.com/@madymorrison . For general fitness: Search 'FitnessBlender on YouTube' this channel: https://www.youtube.com/@FitnessBlender , 'Fitness with MadyMorris ' this channel: https://www.youtube.com/@madymorrison , 'Fitness with Growingannanas'this channel : https://www.youtube.com/watch?v=szXJSRb3tiY or 'Fitness with Juice and Toya' this channel : https://www.youtube.com/@JuiceandToya  on YouTube.  For mindfulness and relaxation: Search 'Music for relaxation' this channel: https://www.youtube.com/watch?v=iyIxRIWl5SI&pp=ygUabWluZGZ1bG5lc3MgYW5kIHJlbGF4YXRpb24%3D , 'Meditation' this channel: https://www.youtube.com/@GreatMeditation or "DrJulie Feeling better" this channel: https://www.youtube.com/@DrJulie on YouTube. For motivation: Search 'Tedex talks ' this channel: https://www.youtube.com/@TEDx ,'Motivation talks' this channel: https://www.youtube.com/@MotivationHubOfficial ,'Motivation talks' this channel: https://www.youtube.com/@MulliganBrothers , "HuberManLab - Scientiic an motivation podcast" this channel: https://www.youtube.com/@hubermanlab/featured, 'Meaning of life' this channel: https://www.youtube.com/@drgabormate9132 on YouTube. `,
          },
          {
            role: "system",
            content: `After every conversation you make a summary and save it but users don't know about that, we only use it to help them and have evidence of their situation so don't talk about past messages. Can you please create a greeting 
            for user that comes back to our app and has the following summary : ${summary.lastConversationSummary}?`,
          },
        ],
        max_tokens: 512,
        temperature: 0.5,
      };

      try {
        const message = await fetch(apiURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(apiRequestBody),
        });

        const data = await message.json();
        console.log("API Response:", data); // Log the response to check the structure and content

        if (
          data.choices &&
          data.choices.length > 0 &&
          data.choices[0]?.message?.content
        ) {
          addNewMessage(data.choices[0].message.content);
        }
      } catch (error) {
        console.error("API Error:", error);
      }
    } else {
      // Greet user with a default message if there is no conversation summary
      addNewMessage(
        `Hello ${summary.name}, welcome to Brainy. I am here to help you. How are you today?`
      );
    }
  };

  // Handle sending messages
  const onSend = useCallback((message = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, message)
    );
    const value = message[0]?.text;
    callApi(value);
  }, []);

  // Call the OpenAI API to get the response
  const callApi = async (value) => {
    const includeVideoInfo = !isLoading && Math.random() < 0.5; // 50% chance to include video info

    let videoInfo = "";
    if (isLoading) {
      videoInfo = "Loading video details...";
    } else if (videoDetails !== null && includeVideoInfo) {
      // includeVideoInfo check added
      const randomVideoIndex = Math.floor(Math.random() * videoDetails.length);
      const video = videoDetails[randomVideoIndex];
      videoInfo = `One video you might find interesting is '${video.snippet.title}' on the channel '${video.snippet.channelTitle}'. Here's the link: https://www.youtube.com/watch?v=${video.id}.`;
    } else {
      videoInfo = "No video details available.";
    }

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a highly empathetic and professional psychologist/terapist. Your primary role is to help users manage their emotions, stress, 
      and mental health issues. You are adept at asking insightful and thought-provoking questions to encourage users to explore 
      their feelings and behaviors. Help them and provide them solution for their problems. Also suggest some great resources for yoga, fitness, relaxation, and motivation. Please let them know that you have resources also appropriate to the user's need.  \n\n${
        includeVideoInfo ? "Some resources: " + videoInfo : ""
      }\n\nUser: ${value}`,
        },
        {
          role: "system",
          content: `Here are some potential resources you can offer to the user. Please recommend these resources as appropriate to the user's needs. Yoga exercises: Search 'Yoga with Adriene' this channel: https://www.youtube.com/@yogawithadriene,'Yoga with Kassandra' this channel : https://www.youtube.com/@yogawithkassandra or 'Yoga with MadyMorris ' this channel: https://www.youtube.com/@madymorrison . For general fitness: Search 'FitnessBlender on YouTube' this channel: https://www.youtube.com/@FitnessBlender , 'Fitness with MadyMorris ' this channel: https://www.youtube.com/@madymorrison , 'Fitness with Growingannanas'this channel : https://www.youtube.com/watch?v=szXJSRb3tiY or 'Fitness with Juice and Toya' this channel : https://www.youtube.com/@JuiceandToya  on YouTube.  For mindfulness and relaxation: Search 'Music for relaxation' this channel: https://www.youtube.com/watch?v=iyIxRIWl5SI&pp=ygUabWluZGZ1bG5lc3MgYW5kIHJlbGF4YXRpb24%3D , 'Meditation' this channel: https://www.youtube.com/@GreatMeditation or "DrJulie Feeling better" this channel: https://www.youtube.com/@DrJulie on YouTube. For motivation: Search 'Tedex talks ' this channel: https://www.youtube.com/@TEDx ,'Motivation talks' this channel: https://www.youtube.com/@MotivationHubOfficial ,'Motivation talks' this channel: https://www.youtube.com/@MulliganBrothers , "HuberManLab - Scientiic an motivation podcast" this channel: https://www.youtube.com/@hubermanlab/featured, 'Meaning of life' this channel: https://www.youtube.com/@drgabormate9132 on YouTube. `,
        },
        {
          role: "system",
          content: `Here are some potential resources you can offer to the user: \
        Yoga exercises: Search 'Yoga with Adriene' this channel: https://www.youtube.com/@yogawithadriene,'Yoga with Kassandra' this channel : https://www.youtube.com/@yogawithkassandra or 'Yoga with MadyMorris ' this channel: https://www.youtube.com/@madymorrison . \
        For general fitness: Search 'FitnessBlender on YouTube' this channel: https://www.youtube.com/@FitnessBlender , 'Fitness with MadyMorris ' this channel: https://www.youtube.com/@madymorrison , 'Fitness with Growingannanas'this channel : https://www.youtube.com/watch?v=szXJSRb3tiY or 'Fitness with Juice and Toya' this channel : https://www.youtube.com/@JuiceandToya  on YouTube. \
        For mindfulness and relaxation: Search 'Music for relaxation' this channel: https://www.youtube.com/watch?v=iyIxRIWl5SI&pp=ygUabWluZGZ1bG5lc3MgYW5kIHJlbGF4YXRpb24%3D , 'Meditation' this channel: https://www.youtube.com/@GreatMeditation or 'DrJulie Feeling better' this channel: https://www.youtube.com/@DrJulie on YouTube. \
        For motivation: Search 'Tedex talks ' this channel: https://www.youtube.com/@TEDx ,'Motivation talks' this channel: https://www.youtube.com/@MotivationHubOfficial ,'Motivation talks' this channel: https://www.youtube.com/@MulliganBrothers , 'HuberManLab - Scientiic an motivation podcast'this channel: https://www.youtube.com/@hubermanlab/featured, 'Meaning of life' this channel: https://www.youtube.com/@drgabormate9132 on YouTube. \
        \n\n User: ${value}`,
        },
        { role: "user", content: value },
      ],
      max_tokens: 1024,
      temperature: 0.5,
    };

    try {
      const res = await fetch(apiURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(apiRequestBody),
      });

      const data = await res.json();
      console.log("API Response:", data); // Log the response to check the structure and content

      if (
        data.choices &&
        data.choices.length > 0 &&
        data.choices[0]?.message?.content
      ) {
        const response = data.choices[0].message.content;
        addNewMessage(response);
      }
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  // Add a new message to the conversation
  const addNewMessage = (data) => {
    const newMessage = {
      _id: Math.random().toString(), // Generate a unique ID for the message
      text: data,
      createdAt: new Date(),
      user: {
        _id: 2,
        name: "Chatbot GPT",
        avatar: logo,
      },
    };
    setMessages((previousMessages) => {
      messagesRef.current = GiftedChat.append(previousMessages, [newMessage]);
      return messagesRef.current;
    });
  };

  // Handle app state changes. Detect when the application went in background
  const handleAppStateChange = (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      console.log("App has come to the foreground!");
    }
    if (nextAppState.match(/inactive|background/)) {
      const currentBackgroundTime = new Date(); // Store the current timestamp when the app goes into the background
      console.log(
        "App went to background at:",
        currentBackgroundTime.toLocaleTimeString()
      );
      summarizeConversation();
    }
    appState.current = nextAppState;
    setAppStateVisible(AppState.currentState);
    console.log("Appstate:", appState.current);
  };

  // Summarize the conversation
  const summarizeConversation = async () => {
    const conversation = messagesRef.current
      .map((message) => `${message.user.name}: ${message.text}`)
      .join("\n");
    const prompt = `You are an expertise in understanding and summarizing conversations. Your task is to extract the main points, emotions and possible actionable items from the following conversation, and summarize it in a concise and comprehensive manner .Be cerfull to not be so log. Here is the conversation you need to summarize: \n${conversation}`;

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    };

    try {
      const res = await fetch(apiURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(apiRequestBody),
      });

      const data = await res.json();
      console.log("API Response:", data); // Log the response to check the structure and content

      if (
        data.choices &&
        data.choices.length > 0 &&
        data.choices[0]?.message?.content
      ) {
        const response = `In the last conversation, you talked about: ${data.choices[0].message.content}`;
        addNewMessage(response);

        saveSummaryToFirebase(response);
      }
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  // Save the conversation summary to Firebase
  const saveSummaryToFirebase = (summary) => {
    const user = auth.currentUser;
    console.log(user.toString);

    if (user != null) {
      const userId = user.uid; // Get logged in user's ID
      console.log(userId);
      const db = getDatabase();
      const userRef = ref(db, `users/${userId}`);

      update(userRef, {
        lastConversationSummary: summary,
      });
    } else {
      console.log("No user is signed in.");
    }
  };

  // Perform layout-related side effects before the browser paints
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitleStyle: { color: "#282534" }, // Set the color of the header title
      headerTintColor: "#282534", // Set the color of the header text and icons
      headerLeft: null, // Hide the header left component
    });
  }, [navigation]); // Re-run the effect when the navigation object changes

  // Custom render for Send button
  const renderSend = (props) => {
    return (
      <Send {...props}>
        <View style={{ marginRight: 10, marginBottom: 10 }}>
          <Ionicons name="send" size={26} color="#282534" />
        </View>
      </Send>
    );
  };

  // Render the chat screen
  return (
    <View style={{ flex: 1, paddingBottom: bottom }}>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{
          _id: 1,
          avatar: `https://ui-avatars.com/api/?background=ffffff&color=282534&length=1&name=${name}`,
        }}
        alwaysShowSend
        scrollToBottom
        renderSend={renderSend}
        showUserAvatar={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  txtView: {
    borderBottomColor: "#EAEBE8",
    borderBottomWidth: 0.5,
    backgroundColor: "fff",
  },
  txt: { alignSelf: "flex-end", padding: 10 },
  chatContainer: {
    backgroundColor: "#fff",
    borderBottomColor: "#D3D3D3",
    borderBottomWidth: 1,
  },
  sendButton: {
    marginLeft: 10,
  },
});

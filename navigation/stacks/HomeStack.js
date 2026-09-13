import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useUser } from "../../context/UserContext";
import { HomeScreen } from "../../screens/HomeScreen";

const Stack = createNativeStackNavigator();

function HomeScreenWrapper({ navigation }) {
  const { user, token } = useUser();
  return (
    <HomeScreen
      user={user}
      token={token}
      onOpenAppointments={() =>
        navigation.navigate("Health", { screen: "AppointmentsList" })
      }
    />
  );
}

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeIndex" component={HomeScreenWrapper} />
    </Stack.Navigator>
  );
}

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PlaceScreen } from "../../screens/PlaceScreen";

const Stack = createNativeStackNavigator();

function PlaceScreenWrapper({ navigation }) {
  return <PlaceScreen navigation={navigation} />;
}

export default function MarketplaceStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MarketplaceIndex" component={PlaceScreenWrapper} />
    </Stack.Navigator>
  );
}

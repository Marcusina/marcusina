import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HealthHubScreen } from "../../screens/HealthHubScreen";
import { AppointmentsListScreen } from "../../screens/AppointmentsListScreen";
import { PrescriptionsListScreen } from "../../screens/PrescriptionsListScreen";
import { InsuranceListScreen } from "../../screens/InsuranceListScreen";

const Stack = createNativeStackNavigator();

function AppointmentsListScreenWrapper({ navigation }) {
  return <AppointmentsListScreen onBack={() => navigation.goBack()} />;
}

function PrescriptionsListScreenWrapper({ navigation }) {
  return <PrescriptionsListScreen onBack={() => navigation.goBack()} />;
}

function InsuranceListScreenWrapper({ navigation }) {
  return <InsuranceListScreen onBack={() => navigation.goBack()} />;
}

export default function HealthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HealthHub" component={HealthHubScreen} />
      <Stack.Screen name="AppointmentsList" component={AppointmentsListScreenWrapper} />
      <Stack.Screen name="PrescriptionsList" component={PrescriptionsListScreenWrapper} />
      <Stack.Screen name="InsuranceList" component={InsuranceListScreenWrapper} />
    </Stack.Navigator>
  );
}

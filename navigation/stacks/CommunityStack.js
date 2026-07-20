import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useUser } from "../../context/UserContext";
import { GroupsScreen } from "../../screens/GroupsScreen";
import { PostScreen } from "../../screens/PostScreen";
import { CreatePostScreen } from "../../screens/CreatePostScreen";

const Stack = createNativeStackNavigator();

function GroupsScreenWrapper({ navigation }) {
  const { token } = useUser();
  return (
    <GroupsScreen
      token={token}
      onBackHome={() => navigation.navigate("Groups")}
      onOpenConsult={() => navigation.navigate("ConsultBooking")}
      onOpenProfile={() => navigation.navigate("Me", { screen: "MeHome" })}
    />
  );
}

function PostScreenWrapper({ route }) {
  return <PostScreen initialPostId={route.params?.postId ?? "short-2"} />;
}

function CreatePostScreenWrapper({ navigation }) {
  return <CreatePostScreen navigation={navigation} />;
}

export default function CommunityStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Groups" component={GroupsScreenWrapper} />
      <Stack.Screen
        name="Post"
        component={PostScreenWrapper}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "",
          headerTintColor: "#FFFFFF",
        }}
      />
      <Stack.Screen name="CreatePost" component={CreatePostScreenWrapper} />
    </Stack.Navigator>
  );
}

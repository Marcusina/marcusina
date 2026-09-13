import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Animated } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Svg, { Defs, LinearGradient, Stop, Circle, Path } from "react-native-svg";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import { useIsWeb, ScreenHeader, SectionLabel, EmptyState, useCollapsibleHeader, SCREEN_HEADER_HEIGHT } from "../components/ScreenKit";
import { getFeed, getMyPosts, getPost } from "../api/community.api";

const TYPE_ICONS = {
  post: "chat-bubble-outline",
  article: "article",
  poll: "poll",
  reel: "movie",
};

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

// Status/story avatars shown across the top of the feed - people and orgs
// whose updates are currently "live". Moved here from Home so status
// belongs alongside the rest of the community content.
const STATUS_USERS = [
  {
    id: "1",
    name: "Dr. Sarah",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "2",
    name: "Dr. James",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "3",
    name: "Health Hub",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "4",
    name: "Dr. Amara",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "5",
    name: "Care Group",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "6",
    name: "Dr. Novak",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
];

const TRENDING_TOPICS = [
  { tag: "#WorldHealthDay", posts: "12,400 posts" },
  { tag: "#MalariaFree2026", posts: "8,200 posts" },
  { tag: "#AfricanNurses", posts: "6,100 posts" },
];

function StatusRow({ user, isWeb, onCreate, onOpenStatus }) {
  const { theme } = useTheme();
  const avatarSize = isWeb ? 80 : 64;
  const strokeWidth = 2.5;
  const radius = (avatarSize - strokeWidth) / 2;
  const center = avatarSize / 2;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ borderBottomColor: theme.border, borderBottomWidth: 1 }}
      contentContainerStyle={{
        flexDirection: "row",
        paddingVertical: 16,
        marginBottom: 16,
        gap: isWeb ? 24 : 16,
        paddingHorizontal: isWeb ? 0 : 16,
      }}
    >
      <TouchableOpacity activeOpacity={0.8} style={{ alignItems: "center", width: avatarSize }} onPress={onCreate}>
        <View
          style={{
            backgroundColor: theme.border,
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {user?.profile?.profile_photo_url?.url ? (
            <Image
              source={{ uri: user.profile.profile_photo_url.url }}
              style={{ width: "100%", height: "100%", borderRadius: avatarSize / 2 }}
            />
          ) : (
            <View
              style={{
                width: "100%",
                height: "100%",
                borderRadius: avatarSize / 2,
                backgroundColor: theme.border,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: avatarSize * 0.4, fontWeight: "bold", color: theme.textSecondary }}>
                {`${user?.profile?.first_name?.[0] || ""}${user?.profile?.last_name?.[0] || ""}`.toUpperCase()}
              </Text>
            </View>
          )}
          <View
            style={{
              backgroundColor: theme.text,
              borderColor: theme.background,
              position: "absolute",
              bottom: 0,
              right: 0,
              width: isWeb ? 24 : 20,
              height: isWeb ? 24 : 20,
              borderRadius: 12,
              borderWidth: 2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialIcons name="add" size={isWeb ? 14 : 12} color={theme.background} />
          </View>
        </View>
        <Text
          numberOfLines={1}
          style={{ color: theme.textSecondary, fontSize: isWeb ? 12 : 11, fontWeight: "500", marginTop: 8, textAlign: "center" }}
        >
          You
        </Text>
      </TouchableOpacity>

      {STATUS_USERS.map((item) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.8}
          style={{ alignItems: "center", width: avatarSize }}
          onPress={() => onOpenStatus(item.id)}
        >
          <View style={{ width: avatarSize, height: avatarSize, alignItems: "center", justifyContent: "center", position: "relative" }}>
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
              <Svg width={avatarSize} height={avatarSize} viewBox={`0 0 ${avatarSize} ${avatarSize}`}>
                <Defs>
                  <LinearGradient id={`communityStatusGradient-${item.id}`} x1="0%" y1="100%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor={theme.primary} />
                    <Stop offset="100%" stopColor={theme.primaryDark} />
                  </LinearGradient>
                </Defs>
                <Circle
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={`url(#communityStatusGradient-${item.id})`}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
              </Svg>
            </View>
            <View style={{ width: "86%", height: "86%", borderRadius: avatarSize / 2, overflow: "hidden" }}>
              <Image source={{ uri: item.avatar }} style={{ width: "100%", height: "100%" }} />
            </View>
          </View>
          <Text
            numberOfLines={1}
            style={{ color: theme.text, fontSize: isWeb ? 12 : 11, fontWeight: "500", marginTop: 8, textAlign: "center", width: "100%" }}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function SpotlightPosts() {
  const { theme } = useTheme();
  return (
    <View>
      {/* Spotlight post - health awareness */}
      <View style={{ backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 10 }}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=80&q=80" }}
            style={{ width: 36, height: 36, borderRadius: 18 }}
          />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={{ color: theme.text, fontSize: 14, fontWeight: "700" }}>Dr. Amaka Eze</Text>
              <MaterialIcons name="verified" size={14} color={theme.primary} />
            </View>
            <Text style={{ color: theme.textSecondary, fontSize: 11 }}>Cardiologist · Lagos · 2h ago</Text>
          </View>
        </View>
        <Text style={{ color: theme.text, fontSize: 13, lineHeight: 18, marginBottom: 10 }}>
          High blood pressure is Africa's silent killer. Early detection and management saves lives. 🩺
          <Text style={{ color: theme.primary, fontWeight: "500" }}> #HeartHealth #MedGram</Text>
        </Text>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&w=700&q=80" }}
          style={{ width: "100%", aspectRatio: 16 / 9, borderRadius: 12, marginBottom: 12 }}
          resizeMode="cover"
        />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Svg width="18" height="18" viewBox="0 0 19 19" fill="none">
              <Path
                d="M9.5 16.5S2 12 2 6.8C2 4.7 3.9 3 6.2 3 7.5 3 8.7 3.58 9.5 4.52 10.3 3.58 11.5 3 12.8 3 15.1 3 17 4.7 17 6.8c0 5.2-7.5 9.7-7.5 9.7Z"
                stroke={theme.textSecondary}
                strokeWidth="1.5"
              />
            </Svg>
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>1.2k</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Svg width="18" height="18" viewBox="0 0 19 19" fill="none">
              <Path
                d="M16.5 10C16.5 13.6 13.4 16.5 9.5 16.5c-.88 0-1.72-.16-2.5-.46L3 17l.97-3.85C3.36 12.3 3 11.2 3 10 3 6.4 5.9 3.5 9.5 3.5S17 6.4 17 10Z"
                stroke={theme.textSecondary}
                strokeWidth="1.5"
              />
            </Svg>
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>84</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Spotlight poll */}
      <View style={{ backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 10 }}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1580281657702-257584239a55?auto=format&fit=crop&w=80&q=80" }}
            style={{ width: 36, height: 36, borderRadius: 18 }}
          />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={{ color: theme.text, fontSize: 14, fontWeight: "700" }}>WHO Africa</Text>
              <MaterialIcons name="verified" size={14} color={theme.primary} />
            </View>
            <Text style={{ color: theme.textSecondary, fontSize: 11 }}>Official Organisation · 5h ago</Text>
          </View>
        </View>
        <Text style={{ color: theme.text, fontSize: 14, fontWeight: "600", marginBottom: 12 }}>
          How often do you get a routine health checkup?
        </Text>
        {[
          { label: "Every 6 months", pct: "38%", color: theme.primary },
          { label: "Once a year", pct: "32%", color: theme.primaryDark },
          { label: "Only when sick", pct: "24%", color: theme.warning },
          { label: "Never", pct: "6%", color: theme.textMuted },
        ].map((item, index) => (
          <View key={index} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: "row", marginBottom: 4, justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: theme.text, fontWeight: "500" }}>{item.label}</Text>
              <Text style={{ fontSize: 12, fontWeight: "700", color: theme.text }}>{item.pct}</Text>
            </View>
            <View style={{ height: 6, width: "100%", backgroundColor: theme.dark ? "#374151" : "#E5E7EB", borderRadius: 3, overflow: "hidden" }}>
              <View style={{ height: "100%", width: item.pct, backgroundColor: item.color }} />
            </View>
          </View>
        ))}
      </View>

      {/* Spotlight post - surgeon milestone */}
      <View style={{ backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 10 }}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=80&q=80" }}
            style={{ width: 36, height: 36, borderRadius: 18 }}
          />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={{ color: theme.text, fontSize: 14, fontWeight: "700" }}>Dr. Chidi Okoye</Text>
              <MaterialIcons name="verified" size={14} color={theme.primary} />
            </View>
            <Text style={{ color: theme.textSecondary, fontSize: 11 }}>Cardiothoracic Surgeon · Abuja · 1d ago</Text>
          </View>
        </View>
        <Text style={{ color: theme.text, fontSize: 13, lineHeight: 18, marginBottom: 10 }}>
          Successfully completed our 200th minimally invasive procedure at National Hospital Abuja. 🌍
        </Text>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=700&q=80" }}
          style={{ width: "100%", aspectRatio: 4 / 3, borderRadius: 12, marginBottom: 12 }}
          resizeMode="cover"
        />
      </View>
    </View>
  );
}

function TrendingTopics() {
  const { theme } = useTheme();
  return (
    <View style={{ paddingVertical: 4, marginBottom: 8 }}>
      {TRENDING_TOPICS.map((item, index, arr) => (
        <View
          key={index}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 12,
            borderBottomWidth: index === arr.length - 1 ? 0 : 1,
            borderBottomColor: theme.border,
          }}
        >
          <View>
            <Text style={{ fontSize: 13, fontWeight: "700", color: theme.primary }}>{item.tag}</Text>
            <Text style={{ fontSize: 10.5, color: theme.textSecondary, marginTop: 2 }}>{item.posts}</Text>
          </View>
          <TouchableOpacity style={{ backgroundColor: theme.primaryLight, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: theme.primary }}>Follow</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

// ─── COM-01 · COMMUNITY FEED ───
export function CommunityFeedScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const { headerStyle, scrollProps, headerHeight } = useCollapsibleHeader(SCREEN_HEADER_HEIGHT);
  const { token, user } = useUser();

  const { data: feedResponse, isLoading, error } = useQuery({
    queryKey: ["communityFeed", user?._id],
    queryFn: () => getFeed(token),
    enabled: !!token,
  });

  const posts = Array.isArray(feedResponse) ? feedResponse : feedResponse?.data || [];

  const titleBar = (
    <Animated.View
      style={[
        { position: "absolute", top: 0, left: 0, right: 0, zIndex: 50, backgroundColor: theme.background },
        headerStyle,
      ]}
    >
      <View className="flex-row items-center justify-between px-4 py-4">
        <Text className="text-2xl font-extrabold" style={{ color: theme.text }}>Community</Text>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => navigation.navigate("GroupsDirectory")}
            className="flex-row items-center px-3 py-2 rounded-full"
            style={{ backgroundColor: theme.surfaceSubtle }}
          >
            <MaterialIcons name="group" size={18} color={theme.text} />
            <Text style={{ color: theme.text }} className="text-xs font-bold ml-1.5">Groups</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("CreatePost")}
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{ backgroundColor: theme.primary }}
          >
            <MaterialIcons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      {titleBar}
      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        <View className={isWeb ? "px-6" : "px-4"}>
          <View className={isWeb ? "max-w-[640px]" : ""}>
            <View className={isWeb ? "px-0" : "-mx-4"}>
              <StatusRow
                user={user}
                isWeb={isWeb}
                onCreate={() => navigation.navigate("CreatePost")}
                onOpenStatus={(id) => navigation.navigate("Post", { postId: id })}
              />
            </View>

            <View className="flex-row items-center justify-between mt-6 mb-2">
              <Text style={{ color: theme.textMuted }} className="text-[11px] font-bold tracking-widest uppercase">
                Community Feed
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("MyPosts")} className="flex-row items-center">
                <MaterialIcons name="person-outline" size={14} color={theme.primary} />
                <Text style={{ color: theme.primary }} className="text-xs font-bold ml-1">My Posts</Text>
              </TouchableOpacity>
            </View>
            <SpotlightPosts />

            <SectionLabel>Trending in Health</SectionLabel>
            <TrendingTopics />

            <SectionLabel>More from the Community</SectionLabel>
            {isLoading ? (
              <View className="items-center justify-center py-10">
                <ActivityIndicator size="large" color={theme.primary} />
              </View>
            ) : error || posts.length === 0 ? (
              <EmptyState
                icon="forum"
                title="No more posts yet"
                description={error?.message || "New posts from the community will show up here."}
              />
            ) : (
              posts.map((post) => {
                const authorName = post.author_name || post.author?.username || "Community Member";
                const isReel = post.type === "reel";
                return (
                  <TouchableOpacity
                    key={post._id}
                    activeOpacity={0.7}
                    onPress={() =>
                      isReel
                        ? navigation.navigate("Post", { postId: post._id })
                        : navigation.navigate("PostDetail", { id: post._id })
                    }
                    style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                    className="rounded-2xl p-4 border mb-3"
                  >
                    <View className="flex-row items-center mb-2">
                      {post.author_avatar ? (
                        <Image source={{ uri: post.author_avatar }} className="w-8 h-8 rounded-full mr-2.5" />
                      ) : (
                        <View style={{ backgroundColor: theme.primaryLight }} className="w-8 h-8 rounded-full items-center justify-center mr-2.5">
                          <MaterialIcons name="person" size={16} color={theme.primary} />
                        </View>
                      )}
                      <View className="flex-1">
                        <Text style={{ color: theme.text }} className="text-sm font-bold">{authorName}</Text>
                        <Text style={{ color: theme.textMuted }} className="text-[11px]">{formatDate(post.created_at)}</Text>
                      </View>
                      <MaterialIcons name={TYPE_ICONS[post.type] || "chat-bubble-outline"} size={16} color={theme.textMuted} />
                    </View>
                    <Text style={{ color: theme.textSecondary }} className="text-sm leading-5" numberOfLines={3}>
                      {post.content || post.title || ""}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

// ─── COM-01b · MY POSTS ───
export function MyPostsScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const { token } = useUser();
  const { headerStyle, scrollProps, headerHeight } = useCollapsibleHeader(SCREEN_HEADER_HEIGHT);

  const { data: postsResponse, isLoading, error } = useQuery({
    queryKey: ["myPosts"],
    queryFn: () => getMyPosts(token),
    enabled: !!token,
  });

  const posts = Array.isArray(postsResponse) ? postsResponse : postsResponse?.data || [];

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <Animated.View
        style={[
          { position: "absolute", top: 0, left: 0, right: 0, zIndex: 50, backgroundColor: theme.background },
          headerStyle,
        ]}
      >
        <ScreenHeader
          title="My Posts"
          onBack={() => navigation.goBack()}
          isWeb={isWeb}
          right={
            <TouchableOpacity
              onPress={() => navigation.navigate("CreatePost")}
              className="w-9 h-9 rounded-full items-center justify-center"
              style={{ backgroundColor: theme.primary }}
            >
              <MaterialIcons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          }
        />
      </Animated.View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center" style={{ paddingTop: headerHeight }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : error || posts.length === 0 ? (
        <View style={{ flex: 1, paddingTop: headerHeight }}>
          <EmptyState
            icon="edit-note"
            title="No posts yet"
            description={error?.message || "Anything you post to the community will show up here."}
          />
        </View>
      ) : (
        <Animated.ScrollView
          contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          {...scrollProps}
        >
          <View className={isWeb ? "px-6" : "px-4"}>
            <View className={isWeb ? "max-w-[640px]" : ""}>
              {posts.map((post) => {
                const isReel = post.type === "reel";
                return (
                  <TouchableOpacity
                    key={post._id}
                    activeOpacity={0.7}
                    onPress={() =>
                      isReel
                        ? navigation.navigate("Post", { postId: post._id })
                        : navigation.navigate("PostDetail", { id: post._id })
                    }
                    style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                    className="rounded-2xl p-4 border mb-3"
                  >
                    <View className="flex-row items-center mb-2">
                      <Text style={{ color: theme.textMuted }} className="text-[11px] flex-1">
                        {formatDate(post.created_at)}
                      </Text>
                      <MaterialIcons name={TYPE_ICONS[post.type] || "chat-bubble-outline"} size={16} color={theme.textMuted} />
                    </View>
                    <Text style={{ color: theme.textSecondary }} className="text-sm leading-5" numberOfLines={3}>
                      {post.content || post.title || ""}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Animated.ScrollView>
      )}
    </View>
  );
}

// ─── COM-02 · POST DETAIL / COMMENTS (standard, non-Shorts posts) ───
export function PostDetailScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const { token } = useUser();
  const { id } = route?.params || {};
  const { headerStyle, scrollProps, headerHeight } = useCollapsibleHeader(SCREEN_HEADER_HEIGHT);

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["post", id],
    queryFn: () => getPost(token, id),
    enabled: !!id && !!token,
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error || !post) {
    return (
      <View className="flex-1" style={{ backgroundColor: theme.background }}>
        <ScreenHeader title="Post" onBack={() => navigation.goBack()} isWeb={isWeb} />
        <EmptyState icon="error-outline" title="Couldn't load this post" description={error?.message} />
      </View>
    );
  }

  const authorName = post.author_name || post.author?.username || "Community Member";
  const comments = Array.isArray(post.comments) ? post.comments : [];

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <Animated.View
        style={[
          { position: "absolute", top: 0, left: 0, right: 0, zIndex: 50, backgroundColor: theme.background },
          headerStyle,
        ]}
      >
        <ScreenHeader title="Post" onBack={() => navigation.goBack()} isWeb={isWeb} />
      </Animated.View>
      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={`mt-5 flex-row items-center mb-3 ${isWeb ? "max-w-[560px]" : ""}`}>
            {post.author_avatar ? (
              <Image source={{ uri: post.author_avatar }} className="w-10 h-10 rounded-full mr-3" />
            ) : (
              <View style={{ backgroundColor: theme.primaryLight }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
                <MaterialIcons name="person" size={20} color={theme.primary} />
              </View>
            )}
            <View>
              <Text style={{ color: theme.text }} className="text-sm font-bold">{authorName}</Text>
              <Text style={{ color: theme.textMuted }} className="text-[11px]">{formatDate(post.created_at)}</Text>
            </View>
          </View>

          {post.title ? (
            <Text style={{ color: theme.text }} className={`text-lg font-extrabold mb-2 ${isWeb ? "max-w-[560px]" : ""}`}>
              {post.title}
            </Text>
          ) : null}

          <Text style={{ color: theme.text }} className={`text-sm leading-6 mb-3 ${isWeb ? "max-w-[560px]" : ""}`}>
            {post.content}
          </Text>

          {post.image_url ? (
            <Image source={{ uri: post.image_url }} className={`w-full h-56 rounded-2xl mb-3 ${isWeb ? "max-w-[560px]" : ""}`} resizeMode="cover" />
          ) : null}

          {Array.isArray(post.poll_options) && post.poll_options.length > 0 ? (
            <View className={`mb-3 ${isWeb ? "max-w-[560px]" : ""}`}>
              {post.poll_options.map((opt, i) => (
                <View
                  key={i}
                  style={{ backgroundColor: theme.surfaceSubtle, borderColor: theme.border }}
                  className="rounded-xl p-3 border mb-2"
                >
                  <Text style={{ color: theme.text }} className="text-sm font-semibold">{opt.label || opt}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <SectionLabel>Comments</SectionLabel>
          {comments.length === 0 ? (
            <Text style={{ color: theme.textMuted }} className="text-sm">No comments yet.</Text>
          ) : (
            <View className={isWeb ? "max-w-[560px]" : ""}>
              {comments.map((c, i) => (
                <View key={c._id || i} style={{ borderColor: theme.border }} className="py-2.5 border-b">
                  <Text style={{ color: theme.text }} className="text-sm font-bold">{c.author_name || "Community Member"}</Text>
                  <Text style={{ color: theme.textSecondary }} className="text-sm mt-0.5">{c.content}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

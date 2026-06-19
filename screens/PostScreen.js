import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  useWindowDimensions,
  Clipboard,
  Alert,
} from "react-native";
import { MaterialIcons, Ionicons, FontAwesome } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";
import { useTheme } from "../context/ThemeContext";

const testVideoUrl = require("../assets/videos/test.mp4");

const DUMMY_SHORTS = [
  {
    id: "1",
    type: "images",
    authorName: "Dr. Sarah",
    authorImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    timeAgo: "4 hours ago",
    mediaUrls: [
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=400&q=85",
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=85",
      "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=400&q=85",
    ],
    factText:
      "Did you know? High blood pressure often has no symptoms. Get checked today — early detection saves lives. Regular monitoring and maintaining a balanced, low-sodium diet drastically lowers operational risks.",
    likes: "4.2k",
    commentsCount: "312",
    views: "1,240 views",
    shareUrl: "https://yourapp.com/shorts/1",
    commentsList: [
      { id: "c1", user: "Ade b.", text: "Wow, needed to hear this today!" },
      { id: "c2", user: "Nurse Chioma", text: "Completely agree, doc!" },
    ],
  },
  {
    id: "2",
    type: "video",
    authorName: "Dr. James",
    authorImage:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    timeAgo: "10 hours ago",
    videoUrl: testVideoUrl,
    bgImage:
      "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=400&q=85",
    factText:
      "Staying hydrated boosts cognitive processing by up to 15%. Keep a water flask near your workstation. Dehydration causes micro-fatigue across complex system environments.",
    likes: "8.9k",
    commentsCount: "520",
    views: "3,410 views",
    shareUrl: "https://yourapp.com/shorts/2",
    commentsList: [
      {
        id: "c3",
        user: "Musa Y.",
        text: "Grabbing my glass of water right now.",
      },
    ],
  },
  {
    id: "3",
    type: "image",
    authorName: "Dr. Sarah",
    authorImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    timeAgo: "4 hours ago",
    bgImage:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=400&q=85",
    factText:
      "Early testing mitigates chronic element risks. Speak with a physician online down the timeline to build structured wellness patterns early.",
    likes: "1.1k",
    commentsCount: "45",
    views: "620 views",
    shareUrl: "https://yourapp.com/shorts/3",
    commentsList: [],
  },
];

const VideoPostPlayer = ({
  itemId,
  videoSource,
  isViewable,
  isPlaying,
  isMuted,
  layoutContentWidth,
  setIsPlaying,
}) => {
  const player = useVideoPlayer(videoSource, (playerInstance) => {
    playerInstance.loop = true;
    playerInstance.muted = isMuted;
  });

  const { currentTime } = useEvent(player, "timeUpdate", {
    currentTime: player.currentTime,
  });
  const duration = player.duration || 0;
  const videoProgressPercentage = duration > 0 ? currentTime / duration : 0;

  useEffect(() => {
    if (!player) return;
    player.muted = isMuted;

    if (isViewable && isPlaying) {
      player.play();
    } else {
      player.pause();
    }
  }, [isViewable, isPlaying, isMuted, player]);

  const handleRewind10 = () => {
    if (player) player.seekTo(Math.max(0, player.currentTime - 10));
  };

  const handleForward10 = () => {
    if (player) player.seekTo(Math.min(duration, player.currentTime + 10));
  };

  const handleProgressBarPress = (event) => {
    if (player && duration > 0) {
      const touchX = event.nativeEvent.locationX;
      const progressBarWidth = layoutContentWidth - 32;
      const percentage = Math.max(0, Math.min(1, touchX / progressBarWidth));
      player.seekTo(percentage * duration);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => setIsPlaying(itemId, !isPlaying)}
      style={{ width: "100%", height: "100%" }}
    >
      <VideoView
        player={player}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
        nativeControls={false}
      />

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleProgressBarPress}
        className="absolute top-4 left-4 right-4 h-3 justify-center z-50"
      >
        <View className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
          <View
            style={{ width: `${videoProgressPercentage * 100}%` }}
            className="h-full bg-teal-400"
          />
        </View>
      </TouchableOpacity>

      {!isPlaying && (
        <View
          className="absolute inset-0 flex-row items-center justify-center gap-6 z-20"
          pointerEvents="box-none"
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleRewind10}
            className="w-12 h-12 rounded-full bg-black/40 items-center justify-center backdrop-blur-sm border border-white/10"
          >
            <MaterialIcons name="replay-10" size={26} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsPlaying(itemId, true)}
            className="w-16 h-16 rounded-full bg-black/40 items-center justify-center backdrop-blur-sm border border-white/10"
          >
            <Ionicons name="play" size={32} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleForward10}
            className="w-12 h-12 rounded-full bg-black/40 items-center justify-center backdrop-blur-sm border border-white/10"
          >
            <MaterialIcons name="forward-10" size={26} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const ShortMediaLoader = ({
  item,
  layoutContentWidth,
  activeCommentsPost,
  activeSharePost,
  currentMediaIndex,
  setCurrentMediaIndex,
  progress,
  setProgress,
  isPlaying,
  setIsPlaying,
  isMuted,
  isViewable,
}) => {
  const progressInterval = useRef(null);

  useEffect(() => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    setProgress(0);

    if (
      item.type === "images" &&
      isViewable &&
      !activeCommentsPost &&
      !activeSharePost
    ) {
      const stepDuration = 4000;
      const intervalStep = 50;
      let elapsed = 0;

      progressInterval.current = setInterval(() => {
        elapsed += intervalStep;
        const nextProgress = Math.min(elapsed / stepDuration, 1);
        setProgress(nextProgress);

        if (elapsed >= stepDuration) {
          clearInterval(progressInterval.current);
          setCurrentMediaIndex((prevIndex) => {
            if (prevIndex < item.mediaUrls.length - 1) {
              setProgress(0);
              return prevIndex + 1;
            } else {
              return 0;
            }
          });
        }
      }, intervalStep);
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [currentMediaIndex, isViewable, activeCommentsPost, activeSharePost]);

  const handleLeftPress = () => {
    if (item.type === "images" && currentMediaIndex > 0) {
      setProgress(0);
      setCurrentMediaIndex(currentMediaIndex - 1);
    }
  };

  const handleRightPress = () => {
    if (item.type === "images") {
      setProgress(0);
      if (currentMediaIndex < item.mediaUrls.length - 1) {
        setCurrentMediaIndex(currentMediaIndex + 1);
      } else {
        setCurrentMediaIndex(0);
      }
    }
  };

  return (
    <View
      style={{ width: layoutContentWidth, height: "100%" }}
      className="absolute inset-0 z-10"
    >
      {item.type === "images" ? (
        <Image
          source={{ uri: item.mediaUrls[currentMediaIndex] }}
          className="w-full h-full"
          resizeMode="cover"
        />
      ) : item.type === "video" ? (
        <VideoPostPlayer
          itemId={item.id}
          videoSource={item.videoUrl}
          isViewable={isViewable}
          isPlaying={isPlaying && !activeCommentsPost && !activeSharePost}
          isMuted={isMuted}
          layoutContentWidth={layoutContentWidth}
          setIsPlaying={setIsPlaying}
        />
      ) : (
        <Image
          source={{ uri: item.bgImage }}
          className="w-full h-full"
          resizeMode="cover"
        />
      )}

      <View
        className="absolute inset-0 bg-black/35 dark:bg-black/50"
        pointerEvents="none"
      />

      {item.type === "images" && (
        <View className="absolute inset-x-0 top-20 bottom-24 flex-row z-20">
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleLeftPress}
            className="flex-1"
          />
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleRightPress}
            className="flex-1"
          />
        </View>
      )}
    </View>
  );
};

export function PostScreen({ initialPostId, brandPrimaryColor = "#00C9A7" }) {
  const { theme } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const [activeCommentsPost, setActiveCommentsPost] = useState(null);
  const [activeSharePost, setActiveSharePost] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [viewablePostId, setViewablePostId] = useState(null);

  const [videoPlaybackStates, setVideoPlaybackStates] = useState({});
  const [videoMuteStates, setVideoMuteStates] = useState({});

  // Track YouTube style expandable status map per item ID
  const [expandedFacts, setExpandedFacts] = useState({});

  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const flatListRef = useRef(null);
  const isLargeScreen = windowWidth >= 768;
  const layoutContentWidth = isLargeScreen ? 420 : windowWidth;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const setItemPlaying = (id, playState) => {
    setVideoPlaybackStates((prev) => ({ ...prev, [id]: playState }));
  };

  const setItemMuted = (id, muteState) => {
    setVideoMuteStates((prev) => ({ ...prev, [id]: muteState }));
  };

  const toggleFactExpanded = (id) => {
    setExpandedFacts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      const activeId = viewableItems[0].item.id;
      setViewablePostId(activeId);

      setVideoPlaybackStates((prev) => ({
        ...prev,
        [activeId]: true,
      }));

      setCurrentMediaIndex(0);
      setProgress(0);
    }
  }).current;

  useEffect(() => {
    if (initialPostId) {
      const targetIndex = DUMMY_SHORTS.findIndex(
        (item) => item.id === initialPostId,
      );
      if (targetIndex !== -1 && flatListRef.current) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: targetIndex,
            animated: false,
          });
        }, 120);
      }
    } else if (DUMMY_SHORTS.length > 0) {
      const firstId = DUMMY_SHORTS[0].id;
      setViewablePostId(firstId);
      setItemPlaying(firstId, true);
    }
  }, [initialPostId, windowHeight]);

  const toggleLike = (id) => {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyLink = (url) => {
    Clipboard.setString(url);
    Alert.alert("Link Copied", "Link copied to clipboard successfully!");
    setActiveSharePost(null);
  };

  const handleIndicatorPress = (index) => {
    setProgress(0);
    setCurrentMediaIndex(index);
  };

  const renderShortItem = ({ item }) => {
    const isLiked = likedPosts[item.id];
    const isViewable = item.id === viewablePostId;

    const itemIsPlaying = videoPlaybackStates[item.id] ?? false;
    const itemIsMuted = videoMuteStates[item.id] ?? true;
    const isExpanded = expandedFacts[item.id] ?? false;

    return (
      <View
        style={{ height: windowHeight, width: layoutContentWidth }}
        className="relative bg-black overflow-hidden self-center"
      >
        {item.type === "images" && (
          <View className="absolute top-4 left-4 right-4 flex-row gap-1.5 z-50 h-6 items-center">
            {item.mediaUrls.map((_, index) => {
              let barWidth = "0%";
              if (index < currentMediaIndex) barWidth = "100%";
              if (index === currentMediaIndex) barWidth = `${progress * 100}%`;

              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.7}
                  onPress={() => handleIndicatorPress(index)}
                  className="flex-1 py-2"
                >
                  <View className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                    <View
                      style={{ width: barWidth }}
                      className="h-full bg-white"
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <ShortMediaLoader
          item={item}
          layoutContentWidth={layoutContentWidth}
          activeCommentsPost={activeCommentsPost}
          activeSharePost={activeSharePost}
          currentMediaIndex={currentMediaIndex}
          setCurrentMediaIndex={setCurrentMediaIndex}
          progress={progress}
          setProgress={setProgress}
          isPlaying={itemIsPlaying}
          setIsPlaying={setItemPlaying}
          isMuted={itemIsMuted}
          isViewable={isViewable}
        />

        <View
          className="flex-1 justify-between pt-16 pb-20 px-4 relative z-30"
          pointerEvents="box-none"
        >
          {/* Header Bar Container */}
          <View
            className="flex-row items-center justify-between gap-3"
            pointerEvents="box-none"
          >
            <View className="flex-row items-center gap-3 flex-1">
              <Image
                source={{ uri: item.authorImage }}
                className="w-10 h-10 rounded-full border-2 border-white"
              />
              <View className="flex-1">
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-white font-bold text-sm tracking-wide">
                    {item.authorName}
                  </Text>
                  <MaterialIcons name="verified" size={14} color="#00C9A7" />
                </View>
                <Text className="text-white/60 text-[11px] font-medium">
                  {item.timeAgo}
                </Text>
              </View>
            </View>

            {item.type === "video" && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setItemMuted(item.id, !itemIsMuted)}
                className="w-10 h-10 rounded-full bg-black/40 items-center justify-center border border-white/20 z-50 backdrop-blur-md"
              >
                <Ionicons
                  name={itemIsMuted ? "volume-mute" : "volume-high"}
                  size={18}
                  color="white"
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Action Columns Panel */}
          <View className="absolute right-4 top-1/3 -translate-y-1/2 items-center gap-4 z-50">
            <View className="items-center gap-1">
              <TouchableOpacity
                onPress={() => toggleLike(item.id)}
                className="w-11 h-11 rounded-full bg-white/15 items-center justify-center backdrop-blur-md"
              >
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={22}
                  color={isLiked ? "#EF4444" : "white"}
                />
              </TouchableOpacity>
              <Text className="text-[10px] font-bold text-white/80">
                {item.likes}
              </Text>
            </View>

            <View className="items-center gap-1">
              <TouchableOpacity
                onPress={() => setActiveCommentsPost(item)}
                className="w-11 h-11 rounded-full bg-white/15 items-center justify-center backdrop-blur-md"
              >
                <Ionicons name="chatbubble-outline" size={20} color="white" />
              </TouchableOpacity>
              <Text className="text-[10px] font-bold text-white/80">
                {item.commentsCount}
              </Text>
            </View>

            <View className="items-center gap-1">
              <TouchableOpacity
                onPress={() => setActiveSharePost(item)}
                className="w-11 h-11 rounded-full bg-white/15 items-center justify-center backdrop-blur-md"
              >
                <Ionicons name="share-social-outline" size={20} color="white" />
              </TouchableOpacity>
              <Text className="text-[10px] font-bold text-white/80">Share</Text>
            </View>
          </View>

          {/* YouTube-Style Bottom Expandable Metadata and Engagement Block */}
          <View className="absolute bottom-6 left-4 right-16 z-40 bg-black/25 rounded-2xl p-2.5 backdrop-blur-xs border border-white/5">
            <View className="flex-row items-center gap-2 mb-2">
              <View className="flex-row">
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=40&q=80",
                  }}
                  className="w-5 h-5 rounded-full border border-white -mr-1.5"
                />
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=40&q=80",
                  }}
                  className="w-5 h-5 rounded-full border border-white"
                />
              </View>
              <Text className="text-white text-[11px] font-bold tracking-wide">
                {item.views}
              </Text>
            </View>

            {/* YouTube Style Expandable Text Area */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => toggleFactExpanded(item.id)}
              className="mb-3"
            >
              <Text
                numberOfLines={isExpanded ? undefined : 2}
                className="text-white text-xs leading-5 font-normal"
              >
                {item.factText}
                {!isExpanded && (
                  <Text className="text-teal-400 text-xs font-bold">
                    {" "}
                    ...read more
                  </Text>
                )}
              </Text>
              {isExpanded && (
                <Text className="text-white/50 text-[10px] font-bold mt-1">
                  Show less
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveCommentsPost(item)}
              className="flex-row items-center justify-between rounded-full bg-white/10 border border-white/10 py-2.5 px-4"
            >
              <Text className="text-white/60 text-[11px] font-medium">
                Reply to {item.authorName.split(" ")[0]}…
              </Text>
              <FontAwesome name="send" size={12} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-neutral-900 justify-center items-center">
      <View
        style={{ width: layoutContentWidth }}
        className="flex-1 bg-black self-center"
      >
        <FlatList
          ref={flatListRef}
          data={DUMMY_SHORTS}
          renderItem={renderShortItem}
          keyExtractor={(item) => item.id}
          pagingEnabled={false}
          snapToInterval={windowHeight}
          snapToAlignment="start"
          decelerationRate={Platform.OS === "ios" ? "fast" : 0.9}
          disableIntervalMomentum={true}
          vertical
          showsVerticalScrollIndicator={false}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          getItemLayout={(data, index) => ({
            length: windowHeight,
            offset: windowHeight * index,
            index,
          })}
        />

        {/* Comments Drawer Modal */}
        <Modal
          visible={activeCommentsPost !== null}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setActiveCommentsPost(null)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 justify-end bg-black/50 items-center"
          >
            <TouchableOpacity
              activeOpacity={1}
              className="flex-1 w-full"
              onPress={() => setActiveCommentsPost(null)}
            />
            <View
              style={{
                backgroundColor: theme.surface,
                width: layoutContentWidth,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              }}
              className="h-[60%] flex-col p-4"
            >
              <View className="w-12 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full self-center mb-4" />
              <View className="flex-row justify-between items-center pb-3 border-b border-neutral-200 dark:border-neutral-800">
                <Text
                  className="text-sm font-extrabold"
                  style={{ color: theme.text }}
                >
                  Comments ({activeCommentsPost?.commentsCount || 0})
                </Text>
                <TouchableOpacity onPress={() => setActiveCommentsPost(null)}>
                  <Ionicons
                    name="close"
                    size={20}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <FlatList
                data={activeCommentsPost?.commentsList || []}
                keyExtractor={(item) => item.id}
                className="flex-1 mt-3"
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View className="flex-row items-start gap-3 my-2.5">
                    <View className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 items-center justify-center">
                      <Text
                        className="text-xs font-bold"
                        style={{ color: "#FFFF" }}
                      >
                        {item.user[0].toUpperCase()}
                      </Text>
                    </View>

                    <View className="flex-1 bg-neutral-100 dark:bg-neutral-900 rounded-2xl rounded-tl-none p-3">
                      <Text
                        className="text-xs font-bold mb-1"
                        style={{ color: "#FFFF" }}
                      >
                        {item.user}
                      </Text>
                      <Text
                        className="text-xs leading-5 font-normal"
                        style={{ color: theme.textSecondary }}
                      >
                        {item.text}
                      </Text>
                    </View>
                  </View>
                )}
              />

              <View className="flex-row items-center gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <TextInput
                  placeholder="Add a comment..."
                  placeholderTextColor={theme.textMuted}
                  className="flex-1 rounded-xl p-3 text-sm"
                  style={{
                    backgroundColor: theme.background,
                    color: theme.text,
                  }}
                />
                <TouchableOpacity
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: brandPrimaryColor }}
                >
                  <FontAwesome name="send" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Share Drawer Bottom Sheet Modal */}
        <Modal
          visible={activeSharePost !== null}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setActiveSharePost(null)}
        >
          <View className="flex-1 justify-end bg-black/60 items-center">
            <TouchableOpacity
              activeOpacity={1}
              className="flex-1 w-full"
              onPress={() => setActiveSharePost(null)}
            />

            <View
              style={{
                backgroundColor: theme.surface,
                width: layoutContentWidth,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              }}
              className="p-4 pb-8"
            >
              <View className="w-12 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full self-center mb-4" />

              <View className="flex-row justify-between items-center pb-3 mb-4 border-b border-neutral-100 dark:border-neutral-800">
                <Text
                  className="text-base font-extrabold"
                  style={{ color: theme.text }}
                >
                  Share
                </Text>
                <TouchableOpacity onPress={() => setActiveSharePost(null)}>
                  <Ionicons
                    name="close"
                    size={22}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-start gap-6 mb-6 px-2">
                <TouchableOpacity
                  className="items-center w-20"
                  onPress={() => {
                    Alert.alert("Share", "Posted to community successfully!");
                    setActiveSharePost(null);
                  }}
                >
                  <View className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950 items-center justify-center mb-2">
                    <MaterialIcons name="groups" size={24} color="#00C9A7" />
                  </View>
                  <Text
                    numberOfLines={2}
                    className="text-[11px] text-center font-semibold"
                    style={{ color: theme.text }}
                  >
                    Community
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="items-center w-20"
                  onPress={() => {
                    Alert.alert("Share", "Posted to feed timeline!");
                    setActiveSharePost(null);
                  }}
                >
                  <View className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950 items-center justify-center mb-2">
                    <MaterialIcons name="campaign" size={24} color="#3B82F6" />
                  </View>
                  <Text
                    numberOfLines={2}
                    className="text-[11px] text-center font-semibold"
                    style={{ color: theme.text }}
                  >
                    Create Post
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row py-2 px-1 gap-5 border-t border-neutral-100 dark:border-neutral-800 pt-4"
              >
                <TouchableOpacity
                  className="items-center w-16"
                  onPress={() => handleCopyLink(activeSharePost?.shareUrl)}
                >
                  <View className="w-11 h-11 rounded-full bg-neutral-100 dark:bg-neutral-800 items-center justify-center mb-1.5">
                    <Ionicons
                      name="link-outline"
                      size={20}
                      color={theme.dark ? "#0000" : "#FFFF"}
                    />
                  </View>
                  <Text
                    className="text-[10px] font-medium"
                    style={{ color: theme.textSecondary }}
                  >
                    Copy Link
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="items-center w-16"
                  onPress={() => setActiveSharePost(null)}
                >
                  <View className="w-11 h-11 rounded-full bg-green-500 items-center justify-center mb-1.5">
                    <FontAwesome name="whatsapp" size={22} color="white" />
                  </View>
                  <Text
                    className="text-[10px] font-medium"
                    style={{ color: theme.textSecondary }}
                  >
                    WhatsApp
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="items-center w-16"
                  onPress={() => setActiveSharePost(null)}
                >
                  <View className="w-11 h-11 rounded-full bg-[#1877F2] items-center justify-center mb-1.5">
                    <FontAwesome name="facebook" size={22} color="white" />
                  </View>
                  <Text
                    className="text-[10px] font-medium"
                    style={{ color: theme.textSecondary }}
                  >
                    Facebook
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="items-center w-16"
                  onPress={() => setActiveSharePost(null)}
                >
                  <View className="w-11 h-11 rounded-full bg-black items-center justify-center mb-1.5 border border-white/20">
                    <Ionicons name="logo-twitter" size={18} color="white" />
                  </View>
                  <Text
                    className="text-[10px] font-medium"
                    style={{ color: theme.textSecondary }}
                  >
                    X
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="items-center w-16"
                  onPress={() => setActiveSharePost(null)}
                >
                  <View className="w-11 h-11 rounded-full bg-neutral-100 dark:bg-neutral-800 items-center justify-center mb-1.5">
                    <Ionicons
                      name="ellipsis-horizontal"
                      size={20}
                      color={theme.dark ? "#0000" : "#FFFF"}
                    />
                  </View>
                  <Text
                    className="text-[10px] font-medium"
                    style={{ color: theme.textSecondary }}
                  >
                    More
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

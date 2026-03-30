import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import {
  MainTabParamList,
  HomeStackParamList,
  SearchStackParamList,
  ProfileStackParamList,
} from '../types';

// Tab screens
import FeedScreen from '../screens/tabs/FeedScreen';
import SearchScreen from '../screens/tabs/SearchScreen';
import ActivityScreen from '../screens/tabs/ActivityScreen';
import ProfileScreen from '../screens/tabs/ProfileScreen';

// Shared detail screens
import AlbumDetailScreen from '../screens/shared/AlbumDetailScreen';
import TrackDetailScreen from '../screens/shared/TrackDetailScreen';
import ArtistDetailScreen from '../screens/shared/ArtistDetailScreen';
import WriteReviewScreen from '../screens/shared/WriteReviewScreen';
import ReviewDetailScreen from '../screens/shared/ReviewDetailScreen';
import UserProfileScreen from '../screens/shared/UserProfileScreen';
import ListDetailScreen from '../screens/shared/ListDetailScreen';
import EditProfileScreen from '../screens/shared/EditProfileScreen';
import MyListsScreen from '../screens/shared/MyListsScreen';
import CreateListScreen from '../screens/shared/CreateListScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const SearchStack = createNativeStackNavigator<SearchStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const DARK = '#0a0a0a';
const SURFACE = '#141414';
const ACCENT = '#6C47FF';
const MUTED = '#555';

const sharedScreenOptions = {
  headerStyle: { backgroundColor: DARK },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '500' as const },
  contentStyle: { backgroundColor: DARK },
};

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={sharedScreenOptions}>
      <HomeStack.Screen name="Feed" component={FeedScreen} options={{ title: 'MicDrop' }} />
      <HomeStack.Screen name="AlbumDetail" component={AlbumDetailScreen} options={{ title: '' }} />
      <HomeStack.Screen name="TrackDetail" component={TrackDetailScreen} options={{ title: '' }} />
      <HomeStack.Screen name="ArtistDetail" component={ArtistDetailScreen} options={{ title: '' }} />
      <HomeStack.Screen name="UserProfile" component={UserProfileScreen} options={{ title: '' }} />
      <HomeStack.Screen name="ReviewDetail" component={ReviewDetailScreen} options={{ title: 'Review' }} />
      <HomeStack.Screen name="WriteReview" component={WriteReviewScreen} options={{ title: 'Write a review' }} />
      <HomeStack.Screen name="ListDetail" component={ListDetailScreen} options={{ title: '' }} />
    </HomeStack.Navigator>
  );
}

function SearchStackNavigator() {
  return (
    <SearchStack.Navigator screenOptions={sharedScreenOptions}>
      <SearchStack.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
      <SearchStack.Screen name="AlbumDetail" component={AlbumDetailScreen} options={{ title: '' }} />
      <SearchStack.Screen name="TrackDetail" component={TrackDetailScreen} options={{ title: '' }} />
      <SearchStack.Screen name="ArtistDetail" component={ArtistDetailScreen} options={{ title: '' }} />
      <SearchStack.Screen name="WriteReview" component={WriteReviewScreen} options={{ title: 'Write a review' }} />
    </SearchStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={sharedScreenOptions}>
      <ProfileStack.Screen name="MyProfile" component={ProfileScreen} options={{ title: 'Profile' }} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit profile' }} />
      <ProfileStack.Screen name="MyLists" component={MyListsScreen} options={{ title: 'My lists' }} />
      <ProfileStack.Screen name="CreateList" component={CreateListScreen} options={{ title: 'New list' }} />
      <ProfileStack.Screen name="ListDetail" component={ListDetailScreen} options={{ title: '' }} />
      <ProfileStack.Screen name="UserProfile" component={UserProfileScreen} options={{ title: '' }} />
      <ProfileStack.Screen name="AlbumDetail" component={AlbumDetailScreen} options={{ title: '' }} />
      <ProfileStack.Screen name="TrackDetail" component={TrackDetailScreen} options={{ title: '' }} />
      <ProfileStack.Screen name="ArtistDetail" component={ArtistDetailScreen} options={{ title: '' }} />
    </ProfileStack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: SURFACE,
          borderTopColor: '#222',
          borderTopWidth: 0.5,
        },
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: MUTED,
        tabBarLabelStyle: { fontSize: 11 },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, [string, string]> = {
            HomeTab:     ['home',           'home-outline'],
            SearchTab:   ['search',         'search-outline'],
            ActivityTab: ['notifications',  'notifications-outline'],
            ProfileTab:  ['person',         'person-outline'],
          };
          const [active, inactive] = icons[route.name] ?? ['ellipse', 'ellipse-outline'];
          return (
            <Ionicons
              name={(focused ? active : inactive) as any}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="HomeTab"     component={HomeStackNavigator}    options={{ title: 'Home' }} />
      <Tab.Screen name="SearchTab"   component={SearchStackNavigator}  options={{ title: 'Search' }} />
      <Tab.Screen name="ActivityTab" component={ActivityScreen}        options={{ title: 'Activity' }} />
      <Tab.Screen name="ProfileTab"  component={ProfileStackNavigator} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

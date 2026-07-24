import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useUser } from "../context/UserContext";
import { Layout } from "../components/Layout";
import MainTabNavigator from "./MainTabNavigator";
import { NotificationsScreen } from "../screens/NotificationsScreen";
import { CartScreen } from "../screens/CartScreen";
import { WishlistScreen } from "../screens/WishlistScreen";
import { ConsultBookingScreen, ConsultConfirmScreen } from "../screens/ConsultScreens";
import {
  DigitalHealthIdScreen,
  RequestPhysicalCardScreen,
  EmergencyProfileScreen,
  EmergencyPrivacyScreen,
  EmergencyAuditLogScreen,
  PublicEmergencyProfileScreen,
  MedGramPassportScreen,
} from "../screens/IdentityScreens";
import {
  ReferralsListScreen,
  ReferralDetailScreen,
  ReferralConsentScreen,
  ReferralFeedbackScreen,
} from "../screens/ReferralScreens";
import {
  HealthRecordHomeScreen,
  RecordEntryDetailScreen,
  AddSelfReportedInfoScreen,
  RecordConsentLogScreen,
  ShareHealthRecordScreen,
  DocumentViewerScreen,
  VaccinationRecordScreen,
} from "../screens/HealthRecordScreens";
import {
  WalletHomeScreen,
  FundWalletScreen,
  FundingSourcesScreen,
  TransactionHistoryScreen,
  ReceiptCenterScreen,
  RefundStatusScreen,
  RecurringPaymentsScreen,
  PaymentMethodsScreen,
  FamilyWalletScreen,
  ProfessionalEarningsScreen,
  WalletTransferScreen,
  QRPaymentScreen,
  EmergencyFundScreen,
  ExpenseCategoriesScreen,
  PaymentAnalyticsScreen,
} from "../screens/WalletScreens";
import {
  UnifiedInboxScreen,
  ConversationThreadScreen,
  NewMessageComposerScreen,
  BroadcastViewerScreen,
  VendorChatThreadScreen,
  CallScreen,
} from "../screens/MessageScreens";
import { CarePlansListScreen, CarePlanDetailScreen } from "../screens/CarePlanScreens";
import { EmergencyModeScreen } from "../screens/EmergencyModeScreen";
import {
  AIChatHomeScreen,
  SymptomCheckScreen,
  AIResponseScreen,
  AIHandoffScreen,
  AIInsightsScreen,
} from "../screens/AIScreens";
import { DocumentVaultScreen, VaultDocumentDetailScreen } from "../screens/DocumentVaultScreens";
import {
  FindDoctorScreen,
  ProfessionalProfileScreen,
  OrganizationProfileScreen,
  WaitingRoomScreen,
  LiveConsultScreen,
  ChatConsultScreen,
  ConsultSummaryScreen,
  ConsultationHistoryScreen,
  RateReviewScreen,
  InstantConsultScreen,
  IncomingRequestsQueueScreen,
  AvailabilityManagerScreen,
  ClinicalDocumentationScreen,
  PatientChartQuickViewScreen,
} from "../screens/ConsultationScreens";
import {
  OrganizationInvitationScreen,
  OrganizationContextSwitcherScreen,
} from "../screens/OrganizationBridgeScreens";
import {
  CareCircleListScreen,
  InviteMemberScreen,
  PermissionEditorScreen,
  DependentsSwitcherScreen,
  DelegationRequestScreen,
  CareCircleAuditLogScreen,
  FamilyDashboardScreen,
} from "../screens/CareCircleScreens";

const Stack = createNativeStackNavigator();

function NotificationsScreenWrapper({ navigation }) {
  return <NotificationsScreen onBackHome={() => navigation.goBack()} />;
}

function CartScreenWrapper({ navigation }) {
  return (
    <CartScreen
      onBackHome={() => navigation.goBack()}
      onOpenPlace={() => navigation.navigate("Tabs", { screen: "Marketplace" })}
    />
  );
}

function WishlistScreenWrapper({ navigation }) {
  return (
    <WishlistScreen
      onBackHome={() => navigation.goBack()}
      onOpenPlace={() => navigation.navigate("Tabs", { screen: "Marketplace" })}
    />
  );
}

function ConsultBookingScreenWrapper({ navigation }) {
  return (
    <ConsultBookingScreen
      onBack={() => navigation.goBack()}
      onProceed={() => navigation.navigate("ConsultConfirm")}
      onGoHome={() => navigation.navigate("Tabs", { screen: "Home" })}
    />
  );
}

function ConsultConfirmScreenWrapper({ navigation }) {
  return (
    <ConsultConfirmScreen
      onBack={() => navigation.navigate("ConsultBooking")}
      onDone={() => navigation.navigate("Tabs", { screen: "Home" })}
    />
  );
}

const TAB_NAMES = ["Home", "Health", "Community", "Marketplace", "Me"];

// Explicit, fully-qualified resolution for every id Layout.js's chrome can
// pass to onNavigate. Nested/cross-tab targets are spelled out rather than
// relying on bare `navigate(name)` bubble-up, since that isn't guaranteed to
// find a screen nested inside a currently-inactive tab.
function buildNavigateTargets(navigationRef) {
  const nav = () => navigationRef?.current;
  return {
    Home: () => nav()?.navigate("Tabs", { screen: "Home" }),
    Health: () => nav()?.navigate("Tabs", { screen: "Health" }),
    Community: () => nav()?.navigate("Tabs", { screen: "Community" }),
    Marketplace: () => nav()?.navigate("Tabs", { screen: "Marketplace" }),
    Me: () => nav()?.navigate("Tabs", { screen: "Me" }),
    MeHome: () => nav()?.navigate("Tabs", { screen: "Me", params: { screen: "MeHome" } }),
    ProfileEdit: () => nav()?.navigate("Tabs", { screen: "Me", params: { screen: "ProfileEdit" } }),
    Settings: () => nav()?.navigate("Tabs", { screen: "Me", params: { screen: "Settings" } }),
    CreatePost: () =>
      nav()?.navigate("Tabs", { screen: "Community", params: { screen: "CreatePost" } }),
    AppointmentsList: () =>
      nav()?.navigate("Tabs", { screen: "Health", params: { screen: "AppointmentsList" } }),
    Notifications: () => nav()?.navigate("Notifications"),
    Wishlist: () => nav()?.navigate("Wishlist"),
    Cart: () => nav()?.navigate("Cart"),
    ConsultBooking: () => nav()?.navigate("ConsultBooking"),
    DigitalHealthId: () => nav()?.navigate("DigitalHealthId"),
    WalletHome: () => nav()?.navigate("WalletHome"),
    ReferralsList: () => nav()?.navigate("ReferralsList"),
    HealthRecordHome: () => nav()?.navigate("HealthRecordHome"),
    UnifiedInbox: () => nav()?.navigate("UnifiedInbox"),
    CarePlansList: () => nav()?.navigate("CarePlansList"),
    EmergencyMode: () => nav()?.navigate("EmergencyMode"),
    AIChatHome: () => nav()?.navigate("AIChatHome"),
    DocumentVault: () => nav()?.navigate("DocumentVault"),
    FindDoctor: () => nav()?.navigate("FindDoctor"),
    ConsultationHistory: () => nav()?.navigate("ConsultationHistory"),
    InstantConsult: () => nav()?.navigate("InstantConsult"),
    IncomingRequestsQueue: () => nav()?.navigate("IncomingRequestsQueue"),
    AvailabilityManager: () => nav()?.navigate("AvailabilityManager"),
    CareCircleList: () => nav()?.navigate("CareCircleList"),
    OrganizationContextSwitcher: () => nav()?.navigate("OrganizationContextSwitcher"),
  };
}

export default function MainStack({ navigationRef, activeTab, setActiveTab }) {
  const { profile, handleLogout } = useUser();
  const navigateTargets = buildNavigateTargets(navigationRef);

  return (
    <Layout
      currentScreen={activeTab}
      onNavigate={(target) => {
        if (TAB_NAMES.includes(target)) {
          setActiveTab(target);
        }
        const resolve = navigateTargets[target];
        if (resolve) {
          resolve();
        } else {
          navigationRef?.current?.navigate(target);
        }
      }}
      userProfile={profile}
      onLogout={handleLogout}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={MainTabNavigator} />
        <Stack.Screen name="Notifications" component={NotificationsScreenWrapper} />
        <Stack.Screen name="Cart" component={CartScreenWrapper} />
        <Stack.Screen name="Wishlist" component={WishlistScreenWrapper} />
        <Stack.Screen name="ConsultBooking" component={ConsultBookingScreenWrapper} />
        <Stack.Screen name="ConsultConfirm" component={ConsultConfirmScreenWrapper} />
        <Stack.Screen name="DigitalHealthId" component={DigitalHealthIdScreen} />
        <Stack.Screen name="RequestPhysicalCard" component={RequestPhysicalCardScreen} />
        <Stack.Screen name="EmergencyProfile" component={EmergencyProfileScreen} />
        <Stack.Screen name="EmergencyPrivacy" component={EmergencyPrivacyScreen} />
        <Stack.Screen name="EmergencyAuditLog" component={EmergencyAuditLogScreen} />
        <Stack.Screen name="PublicEmergencyProfile" component={PublicEmergencyProfileScreen} />
        <Stack.Screen name="MedGramPassport" component={MedGramPassportScreen} />
        <Stack.Screen name="ReferralsList" component={ReferralsListScreen} />
        <Stack.Screen name="ReferralDetail" component={ReferralDetailScreen} />
        <Stack.Screen name="ReferralConsent" component={ReferralConsentScreen} />
        <Stack.Screen name="ReferralFeedback" component={ReferralFeedbackScreen} />
        <Stack.Screen name="HealthRecordHome" component={HealthRecordHomeScreen} />
        <Stack.Screen name="RecordEntryDetail" component={RecordEntryDetailScreen} />
        <Stack.Screen name="AddSelfReportedInfo" component={AddSelfReportedInfoScreen} />
        <Stack.Screen name="RecordConsentLog" component={RecordConsentLogScreen} />
        <Stack.Screen name="ShareHealthRecord" component={ShareHealthRecordScreen} />
        <Stack.Screen name="DocumentViewer" component={DocumentViewerScreen} />
        <Stack.Screen name="VaccinationRecord" component={VaccinationRecordScreen} />
        <Stack.Screen name="WalletHome" component={WalletHomeScreen} />
        <Stack.Screen name="FundWallet" component={FundWalletScreen} />
        <Stack.Screen name="FundingSources" component={FundingSourcesScreen} />
        <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
        <Stack.Screen name="ReceiptCenter" component={ReceiptCenterScreen} />
        <Stack.Screen name="RefundStatus" component={RefundStatusScreen} />
        <Stack.Screen name="RecurringPayments" component={RecurringPaymentsScreen} />
        <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
        <Stack.Screen name="FamilyWallet" component={FamilyWalletScreen} />
        <Stack.Screen name="ProfessionalEarnings" component={ProfessionalEarningsScreen} />
        <Stack.Screen name="WalletTransfer" component={WalletTransferScreen} />
        <Stack.Screen name="QRPayment" component={QRPaymentScreen} />
        <Stack.Screen name="EmergencyFund" component={EmergencyFundScreen} />
        <Stack.Screen name="ExpenseCategories" component={ExpenseCategoriesScreen} />
        <Stack.Screen name="PaymentAnalytics" component={PaymentAnalyticsScreen} />
        <Stack.Screen name="UnifiedInbox" component={UnifiedInboxScreen} />
        <Stack.Screen name="ConversationThread" component={ConversationThreadScreen} />
        <Stack.Screen name="NewMessageComposer" component={NewMessageComposerScreen} />
        <Stack.Screen name="BroadcastViewer" component={BroadcastViewerScreen} />
        <Stack.Screen name="VendorChatThread" component={VendorChatThreadScreen} />
        <Stack.Screen name="Call" component={CallScreen} />
        <Stack.Screen name="CarePlansList" component={CarePlansListScreen} />
        <Stack.Screen name="CarePlanDetail" component={CarePlanDetailScreen} />
        <Stack.Screen name="EmergencyMode" component={EmergencyModeScreen} />
        <Stack.Screen name="AIChatHome" component={AIChatHomeScreen} />
        <Stack.Screen name="SymptomCheck" component={SymptomCheckScreen} />
        <Stack.Screen name="AIResponse" component={AIResponseScreen} />
        <Stack.Screen name="AIHandoff" component={AIHandoffScreen} />
        <Stack.Screen name="AIInsights" component={AIInsightsScreen} />
        <Stack.Screen name="DocumentVault" component={DocumentVaultScreen} />
        <Stack.Screen name="VaultDocumentDetail" component={VaultDocumentDetailScreen} />
        <Stack.Screen name="FindDoctor" component={FindDoctorScreen} />
        <Stack.Screen name="ProfessionalProfile" component={ProfessionalProfileScreen} />
        <Stack.Screen name="OrganizationProfile" component={OrganizationProfileScreen} />
        <Stack.Screen name="WaitingRoom" component={WaitingRoomScreen} />
        <Stack.Screen name="LiveConsult" component={LiveConsultScreen} />
        <Stack.Screen name="ChatConsult" component={ChatConsultScreen} />
        <Stack.Screen name="ConsultSummary" component={ConsultSummaryScreen} />
        <Stack.Screen name="ConsultationHistory" component={ConsultationHistoryScreen} />
        <Stack.Screen name="RateReview" component={RateReviewScreen} />
        <Stack.Screen name="InstantConsult" component={InstantConsultScreen} />
        <Stack.Screen name="IncomingRequestsQueue" component={IncomingRequestsQueueScreen} />
        <Stack.Screen name="AvailabilityManager" component={AvailabilityManagerScreen} />
        <Stack.Screen name="ClinicalDocumentation" component={ClinicalDocumentationScreen} />
        <Stack.Screen name="PatientChartQuickView" component={PatientChartQuickViewScreen} />
        <Stack.Screen name="OrganizationInvitation" component={OrganizationInvitationScreen} />
        <Stack.Screen name="OrganizationContextSwitcher" component={OrganizationContextSwitcherScreen} />
        <Stack.Screen name="CareCircleList" component={CareCircleListScreen} />
        <Stack.Screen name="InviteMember" component={InviteMemberScreen} />
        <Stack.Screen name="PermissionEditor" component={PermissionEditorScreen} />
        <Stack.Screen name="DependentsSwitcher" component={DependentsSwitcherScreen} />
        <Stack.Screen name="DelegationRequest" component={DelegationRequestScreen} />
        <Stack.Screen name="CareCircleAuditLog" component={CareCircleAuditLogScreen} />
        <Stack.Screen name="FamilyDashboard" component={FamilyDashboardScreen} />
      </Stack.Navigator>
    </Layout>
  );
}

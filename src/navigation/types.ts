import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  Transactions: undefined;
  Scan: undefined;
  Insights: undefined;
  Offers: undefined;
};

export type RootStackParamList  = {
  Tabs: NavigatorScreenParams<TabParamList>;
  TransactionForm : { transactionId?: string } | undefined;
  Budgets:undefined;
  Bills: undefined;
  BillDetail : {billId : string};
  SmsReview: undefined;
  OfferDetail:{ offerId: string}
  Notifications : undefined;
  Settings : undefined;
  Gallery: undefined;
  DbTest: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList{}
  }
}
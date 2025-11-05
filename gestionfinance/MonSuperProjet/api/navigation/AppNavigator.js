import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import ClientList from '../../screens/Clients/ClientList';
import TransactionList from '../../screens/Transactions/TransactionList';
import BalanceHistory from '../../screens/Balance/BalanceHistory';
import Notifications from '../../screens/Notifications/Notifications';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Clients" component={ClientList} />
            <Stack.Screen name="Transactions" component={TransactionList} />
            <Stack.Screen name="Balance" component={BalanceHistory} />
            <Stack.Screen name="Notifications" component={Notifications} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

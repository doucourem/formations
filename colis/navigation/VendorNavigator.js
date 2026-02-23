// src/navigation/VendorNavigator.js
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import TripListScreen from "../screens/trips/TripListScreen";
import TicketSellScreen from "../screens/tickets/TicketSellScreen";
import TicketResultScreen from "../screens/tickets/TicketResultScreen";

const Stack = createStackNavigator();

export default function VendorNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Trips">
        <Stack.Screen name="Trips" component={TripListScreen} />
        <Stack.Screen name="TicketSell" component={TicketSellScreen} />
        <Stack.Screen name="TicketResult" component={TicketResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

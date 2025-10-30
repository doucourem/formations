// App.js
import React from "react";
import { Text, View, FlatList, SafeAreaView, StyleSheet } from "react-native";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import axios from "axios";

// Initialisation du client React Query
const queryClient = new QueryClient();

function UsersList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/users");
      return res.data;
    },
  });

  if (isLoading) return <Text>Chargement...</Text>;
  if (error) return <Text>Erreur : {error.message}</Text>;

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text style={styles.name}>
            {item.first_name} {item.last_name}
          </Text>
        </View>
      )}
    />
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Liste des utilisateurs</Text>
        <UsersList />
      </SafeAreaView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  item: { marginVertical: 5 },
  name: { fontSize: 16 },
});

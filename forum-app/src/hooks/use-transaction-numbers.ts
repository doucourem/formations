import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

interface TransactionNumberMap {
  [key: string]: number;
}

interface TransactionNumberData {
  numberMap: TransactionNumberMap;
  totalCount: number;
}

export function useTransactionNumbers(userId: number, date: string) {
  const { data, isLoading, error } = useQuery<TransactionNumberData>({
    queryKey: [`/api/transactions/user-number/${userId}/${date}`],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!userId && !!date,
  });

  const getTransactionNumber = useMemo(() => {
    return (transactionDate: string): number => {
      if (!data?.numberMap) return 1;
      return data.numberMap[transactionDate] || 1;
    };
  }, [data?.numberMap]);

  return {
    getTransactionNumber,
    totalCount: data?.totalCount || 0,
    isLoading,
    error
  };
}
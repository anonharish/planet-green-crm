import { useAppSelector } from "../../app/hooks";
import type { RootState } from "../../app/store";
import { FullScreenLoader } from "./FullScreenLoader/FullScreenLoader";

export const GlobalApiLoader = () => {
  const isPending = useAppSelector((state: RootState) => {
    // baseApi is the reducerPath defined in src/app/api/baseApi.ts
    const queries = state.baseApi.queries;
    const mutations = state.baseApi.mutations;

    const isAnyQueryPending = Object.values(queries).some(
      (query: any) => query?.status === "pending"
    );
    const isAnyMutationPending = Object.values(mutations).some(
      (mutation: any) => mutation?.status === "pending"
    );

    return isAnyQueryPending || isAnyMutationPending;
  });

  if (!isPending) return null;

  return <FullScreenLoader />;
};

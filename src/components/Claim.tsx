import React from "react";
import { handleErrorMessage, TXLego } from "@daohaus/utils";
import { useDHConnect } from "@daohaus/connect";
import { useTxBuilder } from "@daohaus/tx-builder";
import { Spinner, useToast } from "@daohaus/ui";

import { TX } from "../legos/tx";
import { GatedButton } from "./GatedButton";
import { useParams } from "react-router-dom";
import { TARGET_DAO } from "../targetDao";

export const Claim = ({ onSuccess }: { onSuccess: () => void }) => {
  const { fireTransaction } = useTxBuilder();
  const { chainId, address } = useDHConnect();
  const { tcr } = useParams();
  const { errorToast, defaultToast, successToast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClaim = () => {
    setIsLoading(true);
    fireTransaction({
      tx: TX.CLAIM as TXLego,
      callerState: { tcr },
      lifeCycleFns: {
        onTxError: (error) => {
          const errMsg = handleErrorMessage({
            error,
          });
          errorToast({ title: "Claim Failed", description: errMsg });
          setIsLoading(false);
        },
        onTxSuccess: () => {
          defaultToast({
            title: "Claim Success",
            description: "Please wait for subgraph to sync",
          });
          // todo: poll for claim success?
          setIsLoading(false);
        },
        onPollError: (error) => {
          const errMsg = handleErrorMessage({
            error,
          });
          errorToast({ title: "Poll Error", description: errMsg });
          setIsLoading(false);
        },
        onPollSuccess: () => {
          successToast({
            title: "Claim Success",
            description: "Claim success",
          });
          setIsLoading(false);
          onSuccess();
        },
      },
    });
  };

  const isConnectedToDao =
    chainId === TARGET_DAO.CHAIN_ID
      ? true
      : "You are not connected to the same network as the DAO";

  return (
    <GatedButton
      color="secondary"
      rules={[isConnectedToDao]}
      onClick={handleClaim}
      // centerAlign
    >
      {isLoading ? <Spinner size="2rem" strokeWidth=".2rem" /> : "Claim"}
    </GatedButton>
  );
};

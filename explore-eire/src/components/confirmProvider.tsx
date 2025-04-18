"use client";
import { createContext, useState, useContext, ReactNode } from "react";
import { ConfirmModal } from "./confirmModal";

interface ConfirmState {
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    open: boolean;
}

const ConfirmContext = createContext<
    (msg: string) => Promise<boolean>
>(() => Promise.resolve(false));

export const useConfirm = () => useContext(ConfirmContext);

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<ConfirmState>({
        message: "",
        open: false,
    });

    const ask = (message: string) =>
        new Promise<boolean>((resolve) => {
            setState({
                message,
                open: true,
                onConfirm: () => {
                    resolve(true);
                    setState((s) => ({ ...s, open: false }));
                },
                onCancel: () => {
                    resolve(false);
                    setState((s) => ({ ...s, open: false }));
                },
            });
        });

    return (
        <ConfirmContext.Provider value={ask}>
            {children}
            {state.open && <ConfirmModal {...state} />}
        </ConfirmContext.Provider>
    );
}

"use client";
import { createContext, useState, useContext, ReactNode } from "react";
import { ConfirmModal } from "./confirmModal";

// shape of the state for our confirm modal
interface ConfirmState {
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    open: boolean;
}

// exposing a function that shows a modal and returns true/false
const ConfirmContext = createContext<
    (msg: string) => Promise<boolean>
>(() => Promise.resolve(false)); //fallback

export const useConfirm = () => useContext(ConfirmContext);

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<ConfirmState>({
        message: "",
        open: false,
    });

    // function that shows the modal and waits for user input
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

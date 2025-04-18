import React from "react";

interface Props {
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

export const ConfirmModal = ({ message, onCancel, onConfirm }: Props) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
            <p className="mb-6 text-sm text-gray-800">{message}</p>
            <div className="flex justify-end gap-3">
                <button
                    className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={onCancel}
                >
                    Cancel
                </button>
                <button
                    className="rounded bg-[var(--primary-color)] px-4 py-2 text-sm text-white hover:bg-[var(--highlight-color)]"
                    onClick={onConfirm}
                >
                    OK
                </button>
            </div>
        </div>
    </div>
);

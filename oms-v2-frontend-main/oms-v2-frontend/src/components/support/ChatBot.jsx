// ChatBot.jsx
"use client";

import RestApi from "@/utils/RestApi";
import { useState } from "react";

export default function ChatBot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        if (!input) return;

        const newMsg = { role: "user", text: input };
        setMessages((prev) => [...prev, newMsg]);

        setInput("");

        // 🔥 CALL YOUR BACKEND (NestJS)
        const res = await RestApi.post("/api/v1/users/support/chat", { message: input });

        const data = await res.json();

        setMessages((prev) => [
            ...prev,
            { role: "bot", text: data.reply },
        ]);
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setOpen(!open)}
                className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full"
            >
                💬
            </button>

            {open && (
                <div className="fixed bottom-20 right-6 w-80 bg-white shadow-xl rounded-xl flex flex-col">
                    <div className="p-3 border-b font-bold">AI Support</div>

                    <div className="flex-1 p-3 overflow-y-auto h-64">
                        {messages.map((m, i) => (
                            <div key={i} className="mb-2">
                                <b>{m.role === "user" ? "You" : "AI"}:</b> {m.text}
                            </div>
                        ))}
                    </div>

                    <div className="flex border-t">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 p-2 outline-none"
                        />
                        <button onClick={sendMessage} className="px-4 bg-blue-600 text-white">
                            Send
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
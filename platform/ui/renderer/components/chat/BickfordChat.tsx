import React from "react";
import styles from "./BickfordChat.module.css";

export default function BickfordChat() {
  return (
    <div className={styles["bickford-chat-container"]}>
      <div className={styles["bickford-chat-header"]}>Bickford Chat</div>
      <div className={styles["bickford-chat-body"]}>
        <span className={styles["bickford-chat-coming-soon"]}>
          Open Bickford Chat - Coming soon!
        </span>
      </div>
    </div>
  );
}

"use client";

import { useState, type ChangeEvent } from "react";

import {
  ResearchReviewPacketPanel,
  type ResearchReviewPacket,
} from "./ResearchReviewPacketPanel";
import { validateResearchReviewPacket } from "./researchReviewPacketValidation";

type PacketSource = {
  available: boolean;
  error?: string;
  label: string;
  packet: ResearchReviewPacket;
};

type ResearchReviewPacketJsonLoaderProps = {
  initialAvailable: boolean;
  initialError?: string;
  initialPacket: ResearchReviewPacket;
};

const maxLocalPacketBytes = 500_000;

export function ResearchReviewPacketJsonLoader({
  initialAvailable,
  initialError,
  initialPacket,
}: ResearchReviewPacketJsonLoaderProps) {
  const [source, setSource] = useState<PacketSource>({
    available: initialAvailable,
    error: initialError,
    label: initialAvailable ? "Backend sample" : "Fallback sample",
    packet: initialPacket,
  });
  const [loaderMessage, setLoaderMessage] = useState<string>(
    "Select an explicit local .json packet to inspect it in this browser.",
  );
  const [loaderState, setLoaderState] = useState<"idle" | "ok" | "error">("idle");

  async function handlePacketFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".json")) {
      setLoaderState("error");
      setLoaderMessage("Rejected: selected file must be a .json packet.");
      return;
    }

    if (file.size > maxLocalPacketBytes) {
      setLoaderState("error");
      setLoaderMessage("Rejected: packet metadata JSON is larger than 500 KB.");
      return;
    }

    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      const validation = validateResearchReviewPacket(parsed);
      if (!validation.ok) {
        setLoaderState("error");
        setLoaderMessage(`Rejected: ${validation.reason}`);
        return;
      }

      setSource({
        available: true,
        label: `Local JSON: ${file.name}`,
        packet: validation.packet,
      });
      setLoaderState("ok");
      setLoaderMessage(
        "Loaded locally. The file was not uploaded, persisted, or sent to backend APIs.",
      );
    } catch (error) {
      setLoaderState("error");
      setLoaderMessage(
        error instanceof Error
          ? `Rejected: ${error.message}`
          : "Rejected: invalid JSON packet.",
      );
    }
  }

  return (
    <section aria-labelledby="packet-loader-title">
      <div className="packet-loader panel">
        <div>
          <p className="card-kicker">Local JSON</p>
          <h2 id="packet-loader-title">Research packet source</h2>
          <p>
            Current source: <strong>{source.label}</strong>
          </p>
        </div>
        <label className="file-picker">
          <span>Select local .json</span>
          <input
            accept=".json,application/json"
            aria-describedby="packet-loader-status"
            onChange={handlePacketFileChange}
            type="file"
          />
        </label>
        <p
          className={
            loaderState === "error"
              ? "loader-status error"
              : loaderState === "ok"
                ? "loader-status ok"
                : "loader-status"
          }
          id="packet-loader-status"
        >
          {loaderMessage}
        </p>
      </div>

      <ResearchReviewPacketPanel
        available={source.available}
        error={source.error}
        packet={source.packet}
      />
    </section>
  );
}

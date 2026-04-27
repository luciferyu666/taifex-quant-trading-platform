"use client";

import { useState, type ChangeEvent } from "react";

import {
  ResearchReviewPacketPanel,
  type ResearchReviewPacket,
} from "./ResearchReviewPacketPanel";
import { validateResearchReviewPacket } from "./researchReviewPacketValidation";
import type { DashboardCopy } from "../i18n";

type PacketSource = {
  available: boolean;
  error?: string;
  label: string;
  packet: ResearchReviewPacket;
};

type ResearchReviewPacketJsonLoaderProps = {
  copy: DashboardCopy;
  initialAvailable: boolean;
  initialError?: string;
  initialPacket: ResearchReviewPacket;
};

const maxLocalPacketBytes = 500_000;

export function ResearchReviewPacketJsonLoader({
  copy,
  initialAvailable,
  initialError,
  initialPacket,
}: ResearchReviewPacketJsonLoaderProps) {
  const [source, setSource] = useState<PacketSource>({
    available: initialAvailable,
    error: initialError,
    label: initialAvailable ? copy.packetLoader.backendSample : copy.packetLoader.fallbackSample,
    packet: initialPacket,
  });
  const [loaderMessage, setLoaderMessage] = useState<string>(
    copy.packetLoader.initialMessage,
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
      setLoaderMessage(copy.packetLoader.rejectExtension);
      return;
    }

    if (file.size > maxLocalPacketBytes) {
      setLoaderState("error");
      setLoaderMessage(copy.packetLoader.rejectSize);
      return;
    }

    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      const validation = validateResearchReviewPacket(parsed);
      if (!validation.ok) {
        setLoaderState("error");
        setLoaderMessage(`${copy.packetLoader.rejectPrefix}: ${validation.reason}`);
        return;
      }

      setSource({
        available: true,
        label: `${copy.packetLoader.loadedPrefix}: ${file.name}`,
        packet: validation.packet,
      });
      setLoaderState("ok");
      setLoaderMessage(copy.packetLoader.loadedMessage);
    } catch (error) {
      setLoaderState("error");
      setLoaderMessage(
        error instanceof Error
          ? `${copy.packetLoader.rejectPrefix}: ${error.message}`
          : copy.packetLoader.invalidJson,
      );
    }
  }

  return (
    <section aria-labelledby="packet-loader-title">
      <div className="packet-loader panel">
        <div>
          <p className="card-kicker">{copy.packetLoader.localJsonKicker}</p>
          <h2 id="packet-loader-title">{copy.packetLoader.title}</h2>
          <p>
            {copy.packetLoader.currentSource}: <strong>{source.label}</strong>
          </p>
        </div>
        <label className="file-picker">
          <span>{copy.packetLoader.selectFile}</span>
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
        copy={copy}
        error={source.error}
        packet={source.packet}
      />
    </section>
  );
}

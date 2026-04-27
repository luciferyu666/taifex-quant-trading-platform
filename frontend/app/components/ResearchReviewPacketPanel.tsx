import { DecisionSummaryPanel } from "./DecisionSummaryPanel";
import {
  SafetyFlagsPanel,
  type ResearchReviewSafetyFlags,
} from "./SafetyFlagsPanel";
import type { DashboardCopy } from "../i18n";

export type ResearchReviewPacket = ResearchReviewSafetyFlags & {
  packet_id: string;
  packet_label: string;
  review_queue_id: string;
  decision_index_id: string;
  bundle_count: number;
  decision_count: number;
  decision_summary: {
    rejected_count: number;
    needs_data_review_count: number;
    approved_for_paper_research_count: number;
  };
  included_sections: string[];
  checksums: {
    queue_checksum: string;
    decision_checksums: string[];
    index_checksum: string;
    packet_checksum: string;
  };
  reproducibility_hash: string;
  warnings: string[];
};

type ResearchReviewPacketPanelProps = {
  packet: ResearchReviewPacket;
  available: boolean;
  copy: DashboardCopy;
  error?: string;
};

export function ResearchReviewPacketPanel({
  packet,
  available,
  copy,
  error,
}: ResearchReviewPacketPanelProps) {
  return (
    <section className="packet-section" aria-labelledby="packet-title">
      <div className="section-heading">
        <p className="eyebrow">{copy.packet.eyebrow}</p>
        <h2 id="packet-title">{copy.packet.title}</h2>
      </div>
      {!available ? (
        <p className="notice warn">
          {copy.packet.fallbackPrefix} {error}
        </p>
      ) : null}

      <div className="packet-layout">
        <article className="panel packet-overview">
          <div>
            <p className="card-kicker">{copy.packet.identityKicker}</p>
            <h3>{packet.packet_label}</h3>
          </div>
          <dl className="detail-list">
            <div>
              <dt>{copy.packet.packetId}</dt>
              <dd>{packet.packet_id}</dd>
            </div>
            <div>
              <dt>{copy.packet.reviewQueue}</dt>
              <dd>{packet.review_queue_id}</dd>
            </div>
            <div>
              <dt>{copy.packet.decisionIndex}</dt>
              <dd>{packet.decision_index_id}</dd>
            </div>
            <div>
              <dt>{copy.packet.bundles}</dt>
              <dd>{packet.bundle_count}</dd>
            </div>
          </dl>
        </article>

        <DecisionSummaryPanel
          copy={copy.decisionSummary}
          decisionCount={packet.decision_count}
          summary={packet.decision_summary}
        />

        <SafetyFlagsPanel copy={copy.safetyFlags} flags={packet} />
      </div>

      <div className="packet-layout secondary">
        <article className="packet-subpanel">
          <div>
            <p className="card-kicker">{copy.packet.sectionsKicker}</p>
            <h3>{copy.packet.sectionsTitle}</h3>
          </div>
          <ul className="pill-list">
            {packet.included_sections.map((section) => (
              <li key={section}>{section}</li>
            ))}
          </ul>
        </article>

        <article className="packet-subpanel">
          <div>
            <p className="card-kicker">{copy.packet.checksumsKicker}</p>
            <h3>{copy.packet.checksumsTitle}</h3>
          </div>
          <dl className="checksum-list">
            <div>
              <dt>{copy.packet.checksumQueue}</dt>
              <dd>{formatChecksum(packet.checksums.queue_checksum)}</dd>
            </div>
            <div>
              <dt>{copy.packet.checksumDecisionIndex}</dt>
              <dd>{formatChecksum(packet.checksums.index_checksum)}</dd>
            </div>
            <div>
              <dt>{copy.packet.checksumPacket}</dt>
              <dd>{formatChecksum(packet.checksums.packet_checksum)}</dd>
            </div>
            <div>
              <dt>{copy.packet.checksumReproducibility}</dt>
              <dd>{formatChecksum(packet.reproducibility_hash)}</dd>
            </div>
          </dl>
        </article>

        <article className="packet-subpanel">
          <div>
            <p className="card-kicker">{copy.packet.warningsKicker}</p>
            <h3>{copy.packet.warningsTitle}</h3>
          </div>
          <ul className="warning-list">
            {packet.warnings.map((warning) => (
              <li key={warning}>
                {copy.packet.warningLabels[
                  warning as keyof typeof copy.packet.warningLabels
                ] ?? warning}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

function formatChecksum(value: string): string {
  if (value.length <= 24) {
    return value;
  }
  return `${value.slice(0, 12)}...${value.slice(-8)}`;
}

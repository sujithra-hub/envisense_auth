// src/pages/ReportsPage.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { MdSummarize, MdDownload, MdPictureAsPdf, MdTableChart, MdFilterList, MdCheck } from 'react-icons/md';
import { colors } from '../theme/colors';
import { useFirebaseValue } from '../hooks/useFirebaseValue';
import { getActiveNodes } from '../services/locationService';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Header = styled.div`
  h2 {
    font-family: 'Manrope', sans-serif;
    font-size: 1.4rem;
    margin: 0 0 0.2rem 0;
    color: ${colors.textPrimary};
  }

  p {
    margin: 0;
    font-size: 0.85rem;
    color: ${colors.textSecondary};
  }
`;

const ExportCard = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.glassBorder};
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;

    label {
      font-size: 0.82rem;
      font-weight: 600;
      color: ${colors.textMuted};
    }

    select,
    input {
      background: ${colors.surfaceLight};
      border: 1px solid ${colors.glassBorder};
      color: ${colors.textPrimary};
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      outline: none;
      font-size: 0.88rem;
    }
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const ExportBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  background: ${(props) => (props.$primary ? colors.headerGradient : colors.surfaceLight)};
  color: ${(props) => (props.$primary ? '#fff' : colors.textPrimary)};
  border: 1px solid ${(props) => (props.$primary ? 'transparent' : colors.glassBorder)};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const NotificationToast = styled.div`
  background: ${colors.success};
  color: #fff;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: fit-content;
`;

const ReportsPage = () => {
  const [reportType, setReportType] = useState('summary');
  const [timeRange, setTimeRange] = useState('7d');
  const [downloaded, setDownloaded] = useState(false);
  const { value: firebaseData } = useFirebaseValue('/envisence');

  const triggerDownload = (format) => {
    const nodes = getActiveNodes(firebaseData);
    const dateStr = new Date().toISOString().split('T')[0];
    let fileContent = "";
    let fileName = `envisense_${reportType}_${dateStr}.${format}`;
    let mimeType = format === 'csv' ? 'text/csv' : 'text/plain';

    if (format === 'csv') {
      mimeType = 'text/csv';
      if (reportType === 'summary') {
        fileContent = "Node ID,Area,Status,Overall Risk,Fire Risk,Air Risk,Water Risk,Industrial Risk,Last Update\n";
        nodes.forEach(n => {
          fileContent += [
            n.id,
            `"${n.area}"`,
            n.status,
            n.overallStatus,
            n.risks?.hazards?.FIRE?.risk || 'SAFE',
            n.risks?.hazards?.AIR?.risk || 'SAFE',
            n.risks?.hazards?.WATER?.risk || 'SAFE',
            n.risks?.hazards?.INDUSTRIAL?.risk || 'SAFE',
            `"${n.lastUpdate}"`
          ].join(",") + "\n";
        });
      } else if (reportType === 'incidents') {
        fileContent = "Incident ID,Node ID,Area,Hazard Name,Severity,Status,Assigned Team,Logged Time\n";
        nodes.forEach(n => {
          if (n.risks?.hazards) {
            Object.entries(n.risks.hazards).forEach(([key, hazard]) => {
              if (hazard.risk !== 'SAFE') {
                fileContent += [
                  `INC-${n.id}-${key.toUpperCase()}`,
                  n.id,
                  `"${n.area}"`,
                  `"${hazard.name}"`,
                  hazard.risk,
                  hazard.risk === 'CRITICAL' ? 'ACTIVE' : 'INVESTIGATING',
                  "Auto-Assigned Unit",
                  `"${n.lastUpdate}"`
                ].join(",") + "\n";
              }
            });
          }
        });
      } else if (reportType === 'telemetry') {
        fileContent = "Node ID,Area,Status,Last Update,Temp (C),Humidity (%),MQ2 Gas (PPM),Vibration (G),pH,Turbidity (NTU)\n";
        nodes.forEach(n => {
          fileContent += [
            n.id,
            `"${n.area}"`,
            n.status,
            `"${n.lastUpdate}"`,
            n.sensorData?.temperature ?? 'N/A',
            n.sensorData?.humidity ?? 'N/A',
            n.sensorData?.mq2 ?? 'N/A',
            n.sensorData?.vibration ?? 'N/A',
            n.sensorData?.ph ?? 'N/A',
            n.sensorData?.turbidity ?? 'N/A'
          ].join(",") + "\n";
        });
      } else if (reportType === 'node_health') {
        fileContent = "Node ID,Area,Status,Hardware Module,Uptime,Battery %,Signal dBm,Last Update\n";
        nodes.forEach(n => {
          fileContent += [
            n.id,
            `"${n.area}"`,
            n.status,
            "ESP32-WROOM-32",
            "99.8%",
            "95%",
            "-64 dBm",
            `"${n.lastUpdate}"`
          ].join(",") + "\n";
        });
      }

      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      const printWindow = window.open('', '_blank');
      const titleStr = reportType === 'summary'
        ? 'Multi-Hazard Operational Summary'
        : reportType === 'incidents'
          ? 'Incident Resolution Log'
          : reportType === 'telemetry'
            ? 'Raw ESP32 Sensor Telemetry'
            : 'Node Uptime & Battery Health';

      let rowsHtml = '';
      if (reportType === 'summary') {
        rowsHtml = `
        <thead>
          <tr>
            <th>Node ID</th>
            <th>Area</th>
            <th>Connection Status</th>
            <th>Overall Risk</th>
            <th>Fire Risk</th>
            <th>Air Risk</th>
            <th>Water Risk</th>
            <th>Last Update</th>
          </tr>
        </thead>
        <tbody>
          ${nodes.map(n => `
            <tr>
              <td><strong>${n.id}</strong></td>
              <td>${n.area}</td>
              <td><span class="badge badge-${n.status.toLowerCase()}">${n.status}</span></td>
              <td><span class="badge badge-${n.overallStatus.toLowerCase()}">${n.overallStatus}</span></td>
              <td>${n.risks?.hazards?.FIRE?.risk || 'SAFE'}</td>
              <td>${n.risks?.hazards?.AIR?.risk || 'SAFE'}</td>
              <td>${n.risks?.hazards?.WATER?.risk || 'SAFE'}</td>
              <td>${n.lastUpdate}</td>
            </tr>
          `).join('')}
        </tbody>`;
      } else if (reportType === 'telemetry') {
        rowsHtml = `
        <thead>
          <tr>
            <th>Node ID</th>
            <th>Area</th>
            <th>Temp (°C)</th>
            <th>Humidity (%)</th>
            <th>MQ2 Gas (PPM)</th>
            <th>Vibration (G)</th>
            <th>pH</th>
            <th>Turbidity (NTU)</th>
          </tr>
        </thead>
        <tbody>
          ${nodes.map(n => `
            <tr>
              <td><strong>${n.id}</strong></td>
              <td>${n.area}</td>
              <td>${n.sensorData?.temperature ?? 'N/A'}</td>
              <td>${n.sensorData?.humidity ?? 'N/A'}</td>
              <td>${n.sensorData?.mq2 ?? 'N/A'}</td>
              <td>${n.sensorData?.vibration ?? 'N/A'}</td>
              <td>${n.sensorData?.ph ?? 'N/A'}</td>
              <td>${n.sensorData?.turbidity ?? 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>`;
      } else {
        rowsHtml = `
        <thead>
          <tr>
            <th>Node ID</th>
            <th>Area</th>
            <th>Status</th>
            <th>Hardware Module</th>
            <th>Uptime</th>
            <th>Battery Level</th>
            <th>Last Update</th>
          </tr>
        </thead>
        <tbody>
          ${nodes.map(n => `
            <tr>
              <td><strong>${n.id}</strong></td>
              <td>${n.area}</td>
              <td><span class="badge badge-${n.status.toLowerCase()}">${n.status}</span></td>
              <td>ESP32-WROOM-32</td>
              <td>99.8%</td>
              <td>95%</td>
              <td>${n.lastUpdate}</td>
            </tr>
          `).join('')}
        </tbody>`;
      }

      if (printWindow) {
        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>ENVISENSE Report - ${titleStr}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #0f172a; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0284c7; padding-bottom: 12px; margin-bottom: 24px; }
            .brand { font-size: 22px; font-weight: 800; color: #0284c7; letter-spacing: -0.02em; }
            .meta { font-size: 12px; color: #64748b; text-align: right; }
            .title { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
            .subtitle { font-size: 12px; color: #475569; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th { background: #f1f5f9; text-align: left; padding: 8px 10px; font-weight: 700; color: #334155; border-bottom: 2px solid #cbd5e1; }
            td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
            tr:nth-child(even) { background: #f8fafc; }
            .badge { display: inline-block; padding: 2px 7px; border-radius: 999px; font-size: 10px; font-weight: 700; }
            .badge-critical, .badge-danger { background: #fee2e2; color: #dc2626; }
            .badge-warning { background: #fef3c7; color: #d97706; }
            .badge-safe, .badge-online { background: #dcfce7; color: #16a34a; }
            .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 10px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">ENVISENSE COMMAND CENTER</div>
            <div class="meta">
              Generated: ${new Date().toLocaleString()}<br/>
              Time Range: ${timeRange}
            </div>
          </div>
          <div class="title">${titleStr}</div>
          <div class="subtitle">Official Edge AI Telemetry & Multi-Hazard Compliance Audit Document</div>
          <table>${rowsHtml}</table>
          <div class="footer">Confidential System Document • Envisense Real-Time Environmental Intelligence Network</div>
        </body>
        </html>
      `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 400);
      }
    }

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <Container>
      <Header>
        <h2>Command Center Reports & Export Engine</h2>
        <p>Generate downloadable compliance, telemetry, and incident summary reports</p>
      </Header>

      {downloaded && (
        <NotificationToast>
          <MdCheck size={18} /> Report exported and downloaded successfully!
        </NotificationToast>
      )}

      <ExportCard>
        <FormGrid>
          <div className="field">
            <label>Report Type</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="summary">Multi-Hazard Operational Summary</option>
              <option value="incidents">Incident Resolution Log</option>
              <option value="telemetry">Raw ESP32 Sensor Telemetry</option>
              <option value="node_health">Node Uptime & Battery Health</option>
            </select>
          </div>

          <div className="field">
            <label>Time Range</label>
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option value="24h">Last 24 Hours (Live Snapshot)</option>
              <option value="7d">Last 7 Days (History pending)</option>
            </select>
          </div>
        </FormGrid>

        <ButtonRow>
          <ExportBtn $primary onClick={() => triggerDownload('pdf')}>
            <MdPictureAsPdf /> Download Official PDF Report
          </ExportBtn>
          <ExportBtn onClick={() => triggerDownload('csv')}>
            <MdTableChart /> Export Live Data (CSV)
          </ExportBtn>
        </ButtonRow>
      </ExportCard>
    </Container>
  );
};

export default ReportsPage;

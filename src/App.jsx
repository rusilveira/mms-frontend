import "./App.css";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const INTERVALO_ATUALIZACAO = 15000;
// const INTERVALO_ATUALIZACAO = 900000;
const API_URL = import.meta.env.VITE_API_URL;

const CORES = {
  fundo: "#f4f7fb",
  sidebar: "#0b1f33",
  sidebarCard: "#16324f",
  sidebarBorder: "#284b73",
  primaria: "#1d4ed8",
  primariaEscura: "#0f172a",
  primariaClara: "#dbeafe",
  texto: "#0f172a",
  textoSecundario: "#64748b",
  borda: "#e2e8f0",
  painel: "#ffffff",
  sucessoBg: "#dcfce7",
  sucessoTexto: "#166534",
  alertaBg: "#fef3c7",
  alertaTexto: "#92400e",
  criticoBg: "#fee2e2",
  criticoTexto: "#b91c1c",
  umidadeLinha: "#0f766e",
  umidadeArea: "#99f6e4",
  pesoLinha: "#7c3aed",
  bateriaLinha: "#f59e0b",
};

const LIMITES = {
  temperaturaInterna: { min: 28, max: 34 },
  umidadeInterna: { min: 60, max: 85 },
  temperaturaExterna: { min: 20, max: 40 },
  umidadeExterna: { min: 30, max: 95 },
  bateria: { critico: 3.5, atencao: 3.7 },
};

const STATUS_CORES = {
  normal: {
    bg: "#ecfdf5",
    border: "#86efac",
    text: "#166534",
    label: "Normal",
  },
  atencao: {
    bg: "#fffbeb",
    border: "#fcd34d",
    text: "#92400e",
    label: "Atenção",
  },
  critico: {
    bg: "#fef2f2",
    border: "#fca5a5",
    text: "#991b1b",
    label: "Crítico",
  },
};

const COLMEIAS_INICIAIS = [
  {
    id: 1,
    nome: "Colmeia Jataí",
    codigo: "COL-01",
    especie: "Jataí",
    temperaturaInterna: null,
    umidadeInterna: null,
    temperaturaExterna: null,
    umidadeExterna: null,
    peso: null,
    bateria: null,
    historico: [],
  },
];

const OPCOES_PERIODO = [
  ["24h", "24h"],
  ["7d", "7 dias"],
  ["30d", "30 dias"],
  ["all", "Tudo"],
];

const GRAFICOS = {
  temperaturaInterna: {
    titulo: "Temperatura interna",
    subtitulo: "Variação térmica dentro da colmeia",
    dataKey: "temperaturaInterna",
    unidade: "°C",
    cor: CORES.primaria,
    tipo: "line",
  },
  umidadeInterna: {
    titulo: "Umidade interna",
    subtitulo: "Comportamento da umidade dentro da colmeia",
    dataKey: "umidadeInterna",
    unidade: "%",
    cor: CORES.umidadeLinha,
    fill: CORES.umidadeArea,
    tipo: "area",
  },
  temperaturaExterna: {
    titulo: "Temperatura externa",
    subtitulo: "Temperatura ambiente ao redor da colmeia",
    dataKey: "temperaturaExterna",
    unidade: "°C",
    cor: "#ea580c",
    tipo: "line",
  },
  umidadeExterna: {
    titulo: "Umidade externa",
    subtitulo: "Umidade do ambiente externo",
    dataKey: "umidadeExterna",
    unidade: "%",
    cor: "#0891b2",
    fill: "#bae6fd",
    tipo: "area",
  },
  peso: {
    titulo: "Peso da colmeia",
    subtitulo: "Evolução do peso ao longo do período",
    dataKey: "peso",
    unidade: "kg",
    cor: CORES.pesoLinha,
    tipo: "line",
  },
  bateria: {
    titulo: "Bateria",
    subtitulo: "Tensão da alimentação do sistema",
    dataKey: "bateria",
    unidade: "V",
    cor: CORES.bateriaLinha,
    tipo: "line",
  },
};

const S = {
  sidebarCardAtivo: {
    background: "linear-gradient(135deg, #2563eb, #1e3a8a)",
    border: "1px solid #3b82f6",
    boxShadow: "0 12px 30px rgba(37,99,235,0.35)",
    transform: "translateX(4px)",
  },
  sidebarCardBase: {
    background: CORES.sidebarCard,
    border: `1px solid ${CORES.sidebarBorder}`,
    borderRadius: "16px",
    padding: "14px",
    color: "#ffffff",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.25s ease",
  },
  sidebarCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
  },
  sidebarMeta: {
    display: "block",
    marginTop: "8px",
    color: "#cbd5e1",
    fontSize: "13px",
  },
  statusPill: {
    padding: "4px 8px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  headerBadge: {
    background: CORES.painel,
    border: `1px solid ${CORES.borda}`,
    borderRadius: "999px",
    padding: "7px 10px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: CORES.textoSecundario,
    fontSize: "12px",
    fontWeight: 600,
  },
  liveDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#22c55e",
    display: "inline-block",
  },
  heroCard: {
    background: `linear-gradient(135deg, ${CORES.primaria} 0%, ${CORES.primariaEscura} 100%)`,
    color: "#ffffff",
    padding: "13px 15px",
    borderRadius: "18px",
    boxShadow: "0 8px 20px rgba(15,23,42,0.12)",
    width: "100%",
    boxSizing: "border-box",
    position: "relative",
    overflow: "hidden",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "16px",
    marginTop: "-8px",
  },
  periodoGroup: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexWrap: "wrap",
    background: "#ffffff",
    border: `1px solid ${CORES.borda}`,
    borderRadius: "14px",
    padding: "4px",
    boxShadow: "0 2px 8px rgba(15,23,42,0.035)",
  },
  periodoLabel: {
    color: CORES.textoSecundario,
    fontSize: "11px",
    fontWeight: 700,
    padding: "0 6px 0 5px",
  },
  periodoButton: {
    border: "1px solid transparent",
    background: "transparent",
    color: CORES.textoSecundario,
    borderRadius: "12px",
    padding: "8px 11px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "12px",
    transition: "all 0.2s ease",
  },
  periodoButtonAtivo: {
    background: CORES.primaria,
    color: "#fff",
    border: `1px solid ${CORES.primaria}`,
    boxShadow: "0 6px 14px rgba(29,78,216,0.20)",
  },
  panelActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  panelTitle: {
    margin: 0,
    color: CORES.texto,
    fontSize: "18px",
  },
  expandButton: {
    border: `1px solid ${CORES.borda}`,
    background: CORES.painel,
    color: CORES.texto,
    borderRadius: "12px",
    padding: "9px 14px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 700,
    lineHeight: 1,
    transition: "all 0.2s ease",
    boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
  },
  th: {
    textAlign: "center",
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
    color: CORES.textoSecundario,
    fontSize: "13px",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #f1f5f9",
    color: CORES.texto,
    fontSize: "14px",
  },
  metricCard: {
    borderRadius: "16px",
    padding: "16px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
  },
  metricTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },
  metricTitle: {
    margin: 0,
    color: CORES.textoSecundario,
    fontSize: "14px",
  },
  metricValue: {
    marginTop: "12px",
    marginBottom: 0,
    fontSize: "24px",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    background: "#f8fafc",
    borderRadius: "12px",
    padding: "14px",
  },
  summaryLabel: {
    color: CORES.textoSecundario,
    fontSize: "14px",
  },
  summaryValue: {
    color: CORES.texto,
    fontSize: "14px",
  },
  insightCard: {
    background: "#f8fafc",
    border: `1px solid ${CORES.borda}`,
    borderRadius: "14px",
    padding: "14px",
  },
  insightTitle: {
    color: CORES.texto,
  },
  insightText: {
    marginTop: "8px",
    marginBottom: 0,
    color: "#475569",
    lineHeight: 1.5,
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  modalTitle: {
    margin: 0,
    color: CORES.texto,
    fontSize: "26px",
  },
  modalSubtitle: {
    marginTop: "8px",
    marginBottom: 0,
    color: CORES.textoSecundario,
  },
  closeButton: {
    border: "none",
    background: CORES.primaria,
    color: "#fff",
    borderRadius: "12px",
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

function getStatusMeta(status) {
  return STATUS_CORES[status] || STATUS_CORES.normal;
}

function getCellStatusStyle(status) {
  const meta = getStatusMeta(status);

  return {
    color: meta.text,
    background: meta.bg,
    border: `1px solid ${meta.border}`,
    borderRadius: "999px",
    padding: "4px 8px",
    fontSize: "12px",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    lineHeight: 1,
  };
}

function getPesoCellStyle() {
  return {
    color: "#6d28d9",
    background: "#f3e8ff",
    border: "1px solid #d8b4fe",
    borderRadius: "999px",
    padding: "4px 10px",
    fontSize: "12px",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
    gap: "4px",
    lineHeight: 1,
  };
}

function getStatusMetrica(tipo, valor) {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) {
    return null;
  }

  if (tipo === "temperaturaInterna") {
    if (
      valor < LIMITES.temperaturaInterna.min ||
      valor > LIMITES.temperaturaInterna.max
    ) {
      return "critico";
    }
    if (valor < 29 || valor > 33) return "atencao";
    return "normal";
  }

  if (tipo === "umidadeInterna") {
    if (
      valor < LIMITES.umidadeInterna.min ||
      valor > LIMITES.umidadeInterna.max
    ) {
      return "critico";
    }
    if (valor < 65 || valor > 80) return "atencao";
    return "normal";
  }

  if (tipo === "temperaturaExterna") {
    if (
      valor < LIMITES.temperaturaExterna.min ||
      valor > LIMITES.temperaturaExterna.max
    ) {
      return "critico";
    }
    if (valor < 22 || valor > 38) return "atencao";
    return "normal";
  }

  if (tipo === "umidadeExterna") {
    if (
      valor < LIMITES.umidadeExterna.min ||
      valor > LIMITES.umidadeExterna.max
    ) {
      return "critico";
    }
    if (valor < 35 || valor > 90) return "atencao";
    return "normal";
  }

  if (tipo === "bateria") {
    if (valor < LIMITES.bateria.critico) return "critico";
    if (valor < LIMITES.bateria.atencao) return "atencao";
    return "normal";
  }

  return "normal";
}

function formatarValorGrafico(valor, tipo) {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) {
    return "--";
  }

  const numero = Number(valor);

  if (tipo === "umidadeInterna" || tipo === "umidadeExterna") {
    return `${numero.toFixed(0)} %`;
  }
  if (tipo === "peso") return `${numero.toFixed(2)} kg`;
  if (tipo === "bateria") return `${numero.toFixed(3)} V`;

  return `${numero.toFixed(1)} °C`;
}

function calcularEstatisticasGrafico(dados, dataKey) {
  if (!dados?.length) {
    return {
      min: null,
      max: null,
      media: null,
      ultimo: null,
    };
  }

  const valores = dados
    .map((item) => ({
      hora: item.hora,
      valor: Number(item[dataKey]),
    }))
    .filter((item) => !Number.isNaN(item.valor));

  if (!valores.length) {
    return {
      min: null,
      max: null,
      media: null,
      ultimo: null,
    };
  }

  const min = valores.reduce((acc, item) =>
    item.valor < acc.valor ? item : acc
  );
  const max = valores.reduce((acc, item) =>
    item.valor > acc.valor ? item : acc
  );
  const soma = valores.reduce((acc, item) => acc + item.valor, 0);
  const media = soma / valores.length;
  const ultimo = valores[valores.length - 1];

  return { min, max, media, ultimo };
}

function calcularTendencia(historico, chave) {
  if (historico.length < 2) return null;

  const ultimo = historico[historico.length - 1][chave];
  const penultimo = historico[historico.length - 2][chave];

  if (ultimo > penultimo) return "subindo";
  if (ultimo < penultimo) return "descendo";
  return "estável";
}

function calcularVariacao(historico, chave) {
  if (historico.length < 2) return null;

  const primeiro = Number(historico[0][chave] || 0);
  const ultimo = Number(historico[historico.length - 1][chave] || 0);

  return (ultimo - primeiro).toFixed(2);
}

function diferencaMinutos(dataAtual, dataISO) {
  if (!dataISO) return 0;
  const diffMs = new Date(dataAtual).getTime() - new Date(dataISO).getTime();
  return Math.floor(diffMs / 60000);
}

function tituloGrafico(tipo) {
  return `Histórico completo de ${
    GRAFICOS[tipo]?.titulo?.toLowerCase() || tipo
  }`;
}

function periodoTexto(periodo) {
  if (periodo === "24h") return "24h";
  if (periodo === "7d") return "7 dias";
  if (periodo === "30d") return "30 dias";
  return "Completo";
}

function filtrarHistorico(historico, periodo) {
  if (!historico?.length) return [];

  if (periodo === "24h") return historico.slice(-96);
  if (periodo === "7d") return historico.slice(-672);
  if (periodo === "30d") return historico.slice(-2880);

  return historico;
}

function formatarHora(data) {
  return data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function gerarInsights(
  colmeia,
  historico,
  statusTemperatura,
  statusUmidade,
  statusBateria,
  tendenciaPeso
) {
  const semDados =
    !historico.length ||
    colmeia.temperaturaInterna === null ||
    colmeia.umidadeInterna === null ||
    colmeia.bateria === null;

  if (semDados) {
    return [
      {
        titulo: "Aguardando dados",
        texto: `A ${colmeia.nome} ainda não possui leituras suficientes para análise. Assim que os dados forem recebidos, o sistema exibirá o status operacional.`,
      },
    ];
  }

  const insights = [];

  if (statusTemperatura === "critico") {
    insights.push({
      titulo: "Temperatura crítica",
      texto: `A ${colmeia.nome} está fora da faixa ideal de temperatura. Recomenda-se verificar ventilação, exposição solar e condições internas da colmeia.`,
    });
  } else if (statusTemperatura === "atencao") {
    insights.push({
      titulo: "Temperatura em atenção",
      texto: `A ${colmeia.nome} está próxima do limite térmico recomendado. Vale acompanhar a evolução nas próximas leituras.`,
    });
  }

  if (statusUmidade === "critico") {
    insights.push({
      titulo: "Umidade fora do ideal",
      texto: `A umidade da ${colmeia.nome} está em nível crítico. Isso pode afetar o equilíbrio interno da colônia.`,
    });
  } else if (statusUmidade === "atencao") {
    insights.push({
      titulo: "Umidade em observação",
      texto: `A umidade da ${colmeia.nome} está próxima dos limites desejáveis. Monitoramento contínuo é recomendado.`,
    });
  }

  if (statusBateria === "critico") {
    insights.push({
      titulo: "Bateria crítica",
      texto: "A tensão da bateria está abaixo do recomendado e pode comprometer a continuidade do monitoramento.",
    });
  } else if (statusBateria === "atencao") {
    insights.push({
      titulo: "Bateria em atenção",
      texto: "A bateria apresenta queda e deve ser acompanhada para evitar indisponibilidade do sistema.",
    });
  }

  if (tendenciaPeso === "descendo") {
    insights.push({
      titulo: "Queda de peso",
      texto: "O peso da colmeia apresenta tendência de queda no período selecionado. Isso pode indicar consumo de reservas ou alteração no fluxo da colônia.",
    });
  }

  const diffTemp = Math.abs(
    colmeia.temperaturaInterna - colmeia.temperaturaExterna
  );

  if (!Number.isNaN(diffTemp)) {
    if (diffTemp > 5) {
      insights.push({
        titulo: "Isolamento térmico eficiente",
        texto:
          "A colmeia mantém diferença significativa entre ambiente interno e externo, indicando bom isolamento.",
      });
    } else if (diffTemp < 2) {
      insights.push({
        titulo: "Baixo isolamento térmico",
        texto:
          "A temperatura interna acompanha o ambiente externo, sugerindo possível deficiência de isolamento.",
      });
    }
  }

  if (!insights.length) {
    insights.push({
      titulo: "Operação estável",
      texto: `A ${colmeia.nome} está operando dentro dos parâmetros esperados no período selecionado.`,
    });
  }

  return insights.slice(0, 3);
}

function getStatusOperacional({
  offline,
  temLeituraAtual,
  alertaTemperatura,
  alertaBateria,
  statusUmidadeInterna,
  statusTemperaturaExterna,
  statusUmidadeExterna,
}) {
  if (offline) return "Offline";
  if (!temLeituraAtual) return "Sem dados";

  const emAlerta =
    alertaTemperatura ||
    alertaBateria ||
    statusUmidadeInterna === "critico" ||
    statusTemperaturaExterna === "critico" ||
    statusUmidadeExterna === "critico";

  return emAlerta ? "Em alerta" : "Normal";
}

function getDescricaoStatusOperacional({
  offline,
  temLeituraAtual,
  alertaTemperatura,
  alertaBateria,
  statusUmidadeInterna,
  statusTemperaturaExterna,
  statusUmidadeExterna,
}) {
  if (offline) return "Sem comunicação recente";
  if (!temLeituraAtual) return "Aguardando novas leituras do sistema";

  const emAlerta =
    alertaTemperatura ||
    alertaBateria ||
    statusUmidadeInterna === "critico" ||
    statusTemperaturaExterna === "critico" ||
    statusUmidadeExterna === "critico";

  return emAlerta
    ? "Parâmetros exigem atenção"
    : "Parâmetros dentro da faixa esperada";
}

function getStatusSidebarColmeia({
  offline,
  temLeituraAtual,
  alertaTemperatura,
  alertaBateria,
  statusUmidadeInterna,
  statusTemperaturaExterna,
  statusUmidadeExterna,
}) {
  if (offline) {
    return {
      label: "Offline",
      background: "#e5e7eb",
      color: "#374151",
    };
  }

  if (!temLeituraAtual) {
    return {
      label: "Sem dados",
      background: "#e5e7eb",
      color: "#374151",
    };
  }

  const emAlerta =
    alertaTemperatura ||
    alertaBateria ||
    statusUmidadeInterna === "critico" ||
    statusTemperaturaExterna === "critico" ||
    statusUmidadeExterna === "critico";

  if (emAlerta) {
    return {
      label: "Crítico",
      background: CORES.criticoBg,
      color: CORES.criticoTexto,
    };
  }

  return {
    label: "Estável",
    background: CORES.sucessoBg,
    color: CORES.sucessoTexto,
  };
}

function cardsGrid(mobile) {
  return {
    display: "grid",
    gridTemplateColumns: mobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: 0,
  };
}

function HeroSection({
  layoutMobile,
  colmeiaSelecionada,
  periodoSelecionado,
  statusOperacional,
  descricaoStatusOperacional,
}) {
  return (
    <section style={{ display: "block", marginBottom: "18px" }}>
      <div style={S.heroCard}>
        <p
          className="mms-hero__label"
          style={{
            marginBottom: "10px",
            textAlign: "left",
            fontSize: "11px",
            letterSpacing: "0.10em",
            opacity: 0.92,
          }}
        >
          Colmeia selecionada
        </p>

        <div
          style={{
            display: "block",
            minHeight: layoutMobile ? "auto" : "120px",
            paddingRight: layoutMobile ? "0" : "220px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              minHeight: layoutMobile ? "auto" : "112px",
              paddingTop: layoutMobile ? "0" : "14px",
            }}
          >
            <h2
              className="mms-hero__value"
              style={{
                margin: 0,
                textAlign: "left",
                fontSize: layoutMobile ? "22px" : "24px",
                lineHeight: 1.04,
                letterSpacing: "-0.04em",
                transform: layoutMobile ? "none" : "translateY(-4px)",
                color: "#ffffff",
              }}
            >
              {colmeiaSelecionada.nome}
            </h2>

            <p
              className="mms-hero__sub"
              style={{
                marginTop: "2px",
                marginBottom: 0,
                textAlign: "left",
                fontSize: "13px",
                color: "#dbeafe",
                transform: layoutMobile ? "none" : "translateY(-4px)",
              }}
            >
              {colmeiaSelecionada.codigo} • {colmeiaSelecionada.especie}
            </p>

            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginTop: "8px",
                transform: layoutMobile ? "none" : "translateY(-4px)",
              }}
            >
              <span
                style={{
                  background: "rgba(255,255,255,0.14)",
                  color: "#ffffff",
                  borderRadius: "999px",
                  padding: "6px 10px",
                  fontSize: "11px",
                  fontWeight: 700,
                  border: "1px solid rgba(255,255,255,0.14)",
                  lineHeight: 1,
                }}
              >
                {periodoTexto(periodoSelecionado)}
              </span>

              <span
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "#dbeafe",
                  borderRadius: "999px",
                  padding: "6px 10px",
                  fontSize: "11px",
                  fontWeight: 600,
                  border: "1px solid rgba(255,255,255,0.10)",
                  lineHeight: 1,
                }}
              >
                Monitoramento em tempo real
              </span>
            </div>
          </div>

          <div
            style={{
              width: layoutMobile ? "100%" : "180px",
              maxWidth: layoutMobile ? "none" : "180px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "16px",
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              textAlign: "left",
              backdropFilter: "blur(10px)",
              minHeight: layoutMobile ? "auto" : "100px",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
              position: layoutMobile ? "static" : "absolute",
              right: layoutMobile ? "auto" : "14px",
              top: layoutMobile ? "auto" : "50%",
              transform: layoutMobile ? "none" : "translateY(-50%)",
              marginTop: layoutMobile ? "14px" : "0",
            }}
          >
            <span
              style={{
                fontSize: "9px",
                textTransform: "uppercase",
                letterSpacing: "0.10em",
                color: "#bfdbfe",
                fontWeight: 700,
                opacity: 0.92,
              }}
            >
              Status operacional
            </span>

            <strong
              style={{
                marginTop: "8px",
                fontSize: layoutMobile ? "20px" : "22px",
                lineHeight: 1,
                color: "#ffffff",
                letterSpacing: "-0.03em",
              }}
            >
              {statusOperacional}
            </strong>

            <span
              style={{
                marginTop: "8px",
                fontSize: "12px",
                color: "#dbeafe",
                fontWeight: 500,
                lineHeight: 1.35,
                maxWidth: "150px",
              }}
            >
              {descricaoStatusOperacional}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeaderSection({ colmeiasEmAlerta }) {
  return (
    <header className="mms-header mms-header--compact">
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "14px 18px",
            marginBottom: "14px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.035)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "5px",
                height: "32px",
                background: "#2563eb",
                borderRadius: "999px",
              }}
            />

            <div>
              <h1
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "#0f172a",
                  margin: 0,
                  letterSpacing: "-0.3px",
                }}
              >
                Monitoramento inteligente de colmeias
              </h1>

              <p
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginTop: "3px",
                }}
              >
                Dados ambientais e operacionais em tempo real
              </p>
            </div>
          </div>
        </div>

        <div className="mms-header-actions">
          <div style={S.headerBadge}>
            <span style={S.liveDot}></span>
            Tempo real
          </div>
          <div style={S.headerBadge}>Alertas ativos: {colmeiasEmAlerta}</div>
          <div style={S.headerBadge}>Atualização: 15 min</div>
        </div>
      </div>
    </header>
  );
}

function ToolbarPeriodo({ periodoSelecionado, setPeriodoSelecionado }) {
  return (
    <section style={S.toolbar}>
      <div style={S.periodoGroup}>
        <span style={S.periodoLabel}>Período:</span>
        {OPCOES_PERIODO.map(([valor, rotulo]) => (
          <button
            key={valor}
            onClick={() => setPeriodoSelecionado(valor)}
            style={{
              ...S.periodoButton,
              ...(periodoSelecionado === valor ? S.periodoButtonAtivo : {}),
            }}
          >
            {rotulo}
          </button>
        ))}
      </div>
    </section>
  );
}

function CustomTooltip({
  active,
  payload,
  label,
  tipo,
  stats,
  coordinate,
  viewBox,
  mobile = false,
}) {
  if (!active || !payload || !payload.length) return null;

  const config = GRAFICOS[tipo];
  const valor = payload[0]?.value;

  const tooltipWidth = mobile ? 170 : 220;
  const offset = 16;

  let left = 0;

  if (coordinate && viewBox) {
    const limiteDireito = viewBox.x + viewBox.width;
    const abrirParaEsquerda =
      coordinate.x + tooltipWidth + offset > limiteDireito;

    left = abrirParaEsquerda
      ? -tooltipWidth - offset
      : offset;
  }

  return (
    <div
      style={{
        position: "relative",
        left,
        background: "#ffffff",
        opacity: 1,
        border: `1px solid ${CORES.borda}`,
        borderRadius: "16px",
        padding: mobile ? "10px 12px" : "14px 16px",
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.14)",
        minWidth: mobile ? "170px" : "220px",
        maxWidth: mobile ? "170px" : "220px",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: CORES.textoSecundario,
          marginBottom: "8px",
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
          gap: "12px",
        }}
      >
        <span style={{ color: CORES.textoSecundario }}>
          {config.titulo}
        </span>
        <strong style={{ color: CORES.texto, fontSize: mobile ? "16px" : "18px" }}>
          {formatarValorGrafico(valor, tipo)}
        </strong>
      </div>

      <div
        style={{
          borderTop: `1px solid ${CORES.borda}`,
          paddingTop: "10px",
          display: "grid",
          gap: "6px",
          fontSize: mobile ? "12px" : "13px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: CORES.textoSecundario }}>Média</span>
          <strong style={{ color: CORES.texto }}>
            {formatarValorGrafico(stats?.media, tipo)}
          </strong>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: CORES.textoSecundario }}>Mínimo</span>
          <strong style={{ color: "#dc2626" }}>
            {formatarValorGrafico(stats?.min?.valor, tipo)}
          </strong>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: CORES.textoSecundario }}>Máximo</span>
          <strong style={{ color: "#16a34a" }}>
            {formatarValorGrafico(stats?.max?.valor, tipo)}
          </strong>
        </div>
      </div>
    </div>
  );
}

function RenderGrafico({ tipo, dados, altura = 280, expandido = false }) {
  const config = GRAFICOS[tipo];
  if (!config) return null;

  const eixoYProps =
    tipo === "peso" || tipo === "bateria"
      ? { domain: ["auto", "auto"] }
      : {};

  const stats = calcularEstatisticasGrafico(dados, config.dataKey);
  const mobile = typeof window !== "undefined" && window.innerWidth < 768;

  const [hoverX, setHoverX] = useState(null);
  const [refAreaLeft, setRefAreaLeft] = useState(null);
  const [refAreaRight, setRefAreaRight] = useState(null);
  const [zoomData, setZoomData] = useState(() => dados);

  useEffect(() => {
    setZoomData([...dados]);
  }, [dados]);

  return (
    <div style={{ width: "100%", height: altura }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={zoomData}
          margin={{
            top: 16,
            right: mobile ? 8 : 12,
            left: mobile ? 0 : -10,
            bottom: mobile ? 28 : 4,
          }}
          onMouseMove={(e) => {
            if (!e?.activeLabel) return;

            setHoverX(e.activeLabel);

            if (refAreaLeft !== null) {
              setRefAreaRight(e.activeLabel);
            }
          }}
          onMouseLeave={() => setHoverX(null)}
          onMouseDown={(e) => {
            if (e?.activeLabel) setRefAreaLeft(e.activeLabel);
          }}
          onMouseUp={() => {
            if (refAreaLeft !== null && refAreaRight !== null) {
              const start = Math.min(refAreaLeft, refAreaRight);
              const end = Math.max(refAreaLeft, refAreaRight);

              const newData = dados.filter((d) => {
                const x = Number(d.dataCompleta);
                return x >= start && x <= end;
              });

              if (newData.length > 2) {
                setZoomData(newData);
              }
            }

            setRefAreaLeft(null);
            setRefAreaRight(null);
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="rgba(148,163,184,0.18)"
          />

          <XAxis
            dataKey="dataCompleta"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(v) =>
              new Date(v).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            }
          />

          <YAxis {...eixoYProps} />

          <Tooltip
            content={(props) => (
              <CustomTooltip
              {...props}
              tipo={tipo}
              stats={stats}
              mobile={mobile}
            />
          )}
          cursor={false}
          isAnimationActive={false}
          allowEscapeViewBox={{ x: false, y: false }}
          wrapperStyle={{
          pointerEvents: "none",
          outline: "none",
          zIndex: 40,
  }}
/>

          {hoverX !== null && (
            <ReferenceLine
              x={hoverX}
              stroke="#94a3b8"
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.7}
            />
          )}

          {refAreaLeft !== null && refAreaRight !== null && (
            <ReferenceArea
              x1={refAreaLeft}
              x2={refAreaRight}
              fill="rgba(59,130,246,0.15)"
              strokeOpacity={0.4}
            />
          )}

          <Line
            type="linear"
            dataKey={config.dataKey}
            stroke={config.cor}
            strokeWidth={expandido ? 3.5 : 3}
            dot={false}
            activeDot={{
              r: 5,
              stroke: "#fff",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div style={{ marginTop: 10, textAlign: "right" }}>
        <button
          onClick={() => {
            setZoomData([...dados]);
            setRefAreaLeft(null);
            setRefAreaRight(null);
          }}
          style={S.expandButton}
        >
          Reset Zoom
        </button>
      </div>
    </div>
  );
}

function RenderGraficoComparativo({
  tipo,
  dados,
  modo,
  altura = 280,
  expandido = false,
}) {
  const eixoInterno =
    tipo === "temperatura" ? "temperaturaInterna" : "umidadeInterna";
  const eixoExterno =
    tipo === "temperatura" ? "temperaturaExterna" : "umidadeExterna";

  const corInterna =
    tipo === "temperatura" ? CORES.primaria : CORES.umidadeLinha;
  const corExterna = tipo === "temperatura" ? "#ea580c" : "#0891b2";
  const mobile = typeof window !== "undefined" && window.innerWidth < 768;

  const dadosGrafico = dados.map((item, index) => ({
    ...item,
    xGrafico: index,
  }));

  const valoresEsquerda = dados
    .flatMap((item) => {
      const lista = [];

      if (modo === "interna" || modo === "comparar") {
        lista.push(Number(item[eixoInterno]));
      }

      if (modo === "externa" || modo === "comparar") {
        lista.push(Number(item[eixoExterno]));
      }

      return lista;
    })
    .filter((valor) => !Number.isNaN(valor));

  const minEsquerda = valoresEsquerda.length ? Math.min(...valoresEsquerda) : 0;
  const maxEsquerda = valoresEsquerda.length ? Math.max(...valoresEsquerda) : 100;
  const paddingEixo = tipo === "temperatura" ? 2 : 4;

  const dominioEsquerdo = [
    Math.floor(Math.max(0, minEsquerda - paddingEixo)),
    Math.ceil(maxEsquerda + paddingEixo),
  ];

  return (
    <div style={{ width: "100%", height: altura }}>
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "14px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {(modo === "interna" || modo === "comparar") && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: corInterna,
              }}
            />
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
              Interna
            </span>
          </div>
        )}

        {(modo === "externa" || modo === "comparar") && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: corExterna,
              }}
            />
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
              Externa
            </span>
          </div>
        )}

        {modo === "comparar" && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: CORES.pesoLinha,
              }}
            />
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
              Peso
            </span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height="350">
        <LineChart
          data={dadosGrafico}
          margin={{
            top: 8,
            right: modo === "comparar" ? (mobile ? 14 : 24) : mobile ? 8 : 12,
            left: mobile ? 12 : 8,
            bottom: mobile ? 40 : 28,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="rgba(148, 163, 184, 0.18)"
          />

          <XAxis
            dataKey="xGrafico"
            type="number"
            domain={[0, "dataMax"]}
            tickFormatter={(value) => dadosGrafico[value]?.hora || ""}
            tick={{ fontSize: mobile ? 10 : expandido ? 12 : 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            minTickGap={mobile ? 36 : expandido ? 40 : 48}
            height={mobile ? 42 : 36}
            tickMargin={12}
          />

          <YAxis
            yAxisId="left"
            domain={dominioEsquerdo}
            tick={{ fontSize: expandido ? 12 : 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            width={mobile ? 30 : 40}
          />

          {modo === "comparar" && (
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={CORES.pesoLinha}
              tick={{ fontSize: expandido ? 11 : 10, fill: CORES.pesoLinha }}
              axisLine={false}
              tickLine={false}
              width={mobile ? 20 : 28}
              tickMargin={6}
            />
          )}

          {tipo === "temperatura" && (
            <ReferenceArea y1={28} y2={34} fill="rgba(34,197,94,0.08)" />
          )}
          {tipo === "umidade" && (
            <ReferenceArea y1={60} y2={85} fill="rgba(34,197,94,0.08)" />
          )}

          <Tooltip
  wrapperStyle={{
    pointerEvents: "none",
    outline: "none",
    zIndex: 40,
  }}
  allowEscapeViewBox={{ x: false, y: false }}
  cursor={{
    stroke: "#64748b",
    strokeWidth: 1,
    opacity: 0.4,
  }}
  content={({ active, payload, label, coordinate, viewBox }) => {
    if (!active || !payload || !payload.length) return null;

    const unique = [];
    const map = new Set();

    payload.forEach((item) => {
      if (!item || !item.dataKey) return;

      if (!map.has(item.dataKey)) {
        map.add(item.dataKey);
        unique.push(item);
      }
    });

    const tooltipWidth = mobile ? 165 : 180;
    const offset = 16;

    let left = 0;

    if (coordinate && viewBox) {
      const limiteDireito = viewBox.x + viewBox.width;
      const abrirParaEsquerda =
        coordinate.x + tooltipWidth + offset > limiteDireito;

      left = abrirParaEsquerda ? -tooltipWidth - offset : offset;
    }

    return (
      <div
        style={{
          position: "relative",
          left,
          background: "#fff",
          opacity: 1,
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: mobile ? "10px" : "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
          minWidth: mobile ? "165px" : "180px",
          maxWidth: mobile ? "165px" : "180px",
          backdropFilter: "none",
          WebkitBackdropFilter: "none",
          pointerEvents: "none",
          zIndex: 50,
        }}
      >
        <div
          style={{
            fontSize: "12px",
            color: "#64748b",
            marginBottom: "6px",
            fontWeight: 700,
          }}
        >
          {dadosGrafico[label]?.hora || ""}
        </div>

        {unique.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              marginBottom: "4px",
            }}
          >
            <span style={{ color: "#64748b" }}>
              {item.dataKey === "peso"
                ? "Peso"
                : item.dataKey.includes("Interna")
                ? "Interna"
                : "Externa"}
            </span>

            <strong style={{ color: item.color }}>
              {item.dataKey === "peso"
                ? `${Number(item.value).toFixed(2)} kg`
                : tipo === "temperatura"
                ? `${Number(item.value).toFixed(1)} °C`
                : `${Number(item.value).toFixed(0)} %`}
            </strong>
          </div>
        ))}
      </div>
    );
  }}
/>

          {(modo === "interna" || modo === "comparar") && (
            <>
              {modo !== "comparar" && (
                <Area
                  yAxisId="left"
                  type="linear"
                  dataKey={eixoInterno}
                  stroke="none"
                  fill={corInterna}
                  fillOpacity={0.08}
                />
              )}

              <Line
                yAxisId="left"
                type="linear"
                dataKey={eixoInterno}
                stroke={corInterna}
                strokeWidth={modo !== "comparar" ? 4.5 : expandido ? 3.5 : 3}
                dot={false}
                isAnimationActive={false}
                activeDot={{
                  r: expandido ? 6 : 5,
                  stroke: "#ffffff",
                  strokeWidth: 2,
                  fill: corInterna,
                }}
              />
            </>
          )}

          {(modo === "externa" || modo === "comparar") && (
            <>
              {modo !== "comparar" && (
                <Area
                  yAxisId="left"
                  type="linear"
                  dataKey={eixoExterno}
                  stroke="none"
                  fill={corExterna}
                  fillOpacity={0.08}
                />
              )}

              <Line
                yAxisId="left"
                type="linear"
                dataKey={eixoExterno}
                stroke={corExterna}
                strokeWidth={modo !== "comparar" ? 4.5 : expandido ? 3.5 : 3}
                dot={false}
                isAnimationActive={false}
                strokeDasharray={modo === "comparar" ? "6 4" : "0"}
                activeDot={{
                  r: expandido ? 6 : 5,
                  stroke: "#ffffff",
                  strokeWidth: 2,
                  fill: corExterna,
                }}
              />
            </>
          )}

          {modo === "comparar" && (
            <Line
              yAxisId="right"
              type="linear"
              dataKey="peso"
              stroke={CORES.pesoLinha}
              strokeWidth={2}
              dot={false}
              strokeDasharray="3 4"
              opacity={0.75}
              isAnimationActive={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function GraficoComparativoPanel({
  titulo,
  tag,
  onExpand,
  modo,
  setModo,
  tipo,
  dados,
  statsInterna,
  statsExterna,
}) {
  return (
    <div className="mms-panel">
      <div
        className="mms-panel__header"
        style={{
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "14px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            minHeight: "40px",
            flex: 1,
          }}
        >
          <div className="mms-title-row">
            <span className="mms-title-row__accent"></span>
            <h3 className="mms-title-row__text">{titulo}</h3>
          </div>
        </div>

        <div
          style={{
            ...S.panelActions,
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <div
            className="mms-compare-toggle"
            style={{
              display: "flex",
              gap: "6px",
              background: "#f1f5f9",
              padding: "4px",
              borderRadius: "12px",
            }}
          >
            {[
              ["interna", "Interna"],
              ["externa", "Externa"],
              ["comparar", "Comparar"],
            ].map(([valor, rotulo]) => (
              <button
                key={valor}
                onClick={() => setModo(valor)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "10px",
                  border: "none",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  background: modo === valor ? "#1d4ed8" : "transparent",
                  color: modo === valor ? "#ffffff" : "#64748b",
                }}
              >
                {rotulo}
              </button>
            ))}
          </div>

          <span className="mms-panel__tag">{tag}</span>

          <button style={S.expandButton} onClick={onExpand}>
            Expandir
          </button>
        </div>
      </div>

      <div className="mms-compare-stats">
        {(modo === "interna" || modo === "comparar") && (
          <div className="mms-compare-stat-card">
            <span>
              {tipo === "temperatura"
                ? "Temperatura interna"
                : "Umidade interna"}
            </span>
            <strong>
              Média:{" "}
              {formatarValorGrafico(
                statsInterna?.media,
                tipo === "temperatura" ? "temperaturaInterna" : "umidadeInterna"
              )}
            </strong>
            <small>
              Mín:{" "}
              {formatarValorGrafico(
                statsInterna?.min?.valor,
                tipo === "temperatura" ? "temperaturaInterna" : "umidadeInterna"
              )}{" "}
              • Máx:{" "}
              {formatarValorGrafico(
                statsInterna?.max?.valor,
                tipo === "temperatura" ? "temperaturaInterna" : "umidadeInterna"
              )}
            </small>
          </div>
        )}

        {(modo === "externa" || modo === "comparar") && (
          <div className="mms-compare-stat-card">
            <span>
              {tipo === "temperatura"
                ? "Temperatura externa"
                : "Umidade externa"}
            </span>
            <strong>
              Média:{" "}
              {formatarValorGrafico(
                statsExterna?.media,
                tipo === "temperatura" ? "temperaturaExterna" : "umidadeExterna"
              )}
            </strong>
            <small>
              Mín:{" "}
              {formatarValorGrafico(
                statsExterna?.min?.valor,
                tipo === "temperatura" ? "temperaturaExterna" : "umidadeExterna"
              )}{" "}
              • Máx:{" "}
              {formatarValorGrafico(
                statsExterna?.max?.valor,
                tipo === "temperatura" ? "temperaturaExterna" : "umidadeExterna"
              )}
            </small>
          </div>
        )}
      </div>

      <RenderGraficoComparativo tipo={tipo} dados={dados} modo={modo} altura={360} />
    </div>
  );
}

function MetricCard({ titulo, valor, destaque = false, status = null }) {
  const visualStatus = status ? getStatusMeta(status) : null;

  return (
    <div
      className="mms-metric-card"
      style={{
        ...S.metricCard,
        border: destaque ? "1px solid #fecaca" : `1px solid ${CORES.borda}`,
        background: destaque ? "#fff7f7" : CORES.painel,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "140px",
      }}
    >
      <div style={S.metricTop}>
        <p style={S.metricTitle}>{titulo}</p>

        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {visualStatus && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 700,
                color: visualStatus.text,
                background: visualStatus.bg,
                border: `1px solid ${visualStatus.border}`,
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: visualStatus.text,
                }}
              />
              {visualStatus.label}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h3
          style={{
            ...S.metricValue,
            margin: 0,
            textAlign: "center",
          }}
        >
          {valor}
        </h3>
      </div>

      <p
        style={{
          marginTop: "10px",
          marginBottom: 0,
          fontSize: "13px",
          color: CORES.textoSecundario,
          textAlign: "center",
        }}
      >
        {status === "critico"
          ? "Fora da faixa ideal"
          : status === "atencao"
          ? "Próximo do limite"
          : status === "normal"
          ? "Dentro da faixa ideal"
          : "Aguardando leitura"}
      </p>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div style={S.summaryRow}>
      <span style={S.summaryLabel}>{label}</span>
      <strong style={S.summaryValue}>{value}</strong>
    </div>
  );
}

function InsightItem({ titulo, texto }) {
  return (
    <div style={S.insightCard}>
      <strong style={S.insightTitle}>{titulo}</strong>
      <p style={S.insightText}>{texto}</p>
    </div>
  );
}

export default function App() {
  const [colmeias, setColmeias] = useState(COLMEIAS_INICIAIS);
  const colmeiaSelecionada = colmeias[0];

  const [graficoExpandido, setGraficoExpandido] = useState(null);
  const [periodoSelecionado, setPeriodoSelecionado] = useState("24h");
  const [menuAberto, setMenuAberto] = useState(false);
  const [modoTemperatura, setModoTemperatura] = useState("comparar");
  const [modoUmidade, setModoUmidade] = useState("comparar");
  const [limiteHistorico, setLimiteHistorico] = useState(
    typeof window !== "undefined" && window.innerWidth < 1100 ? 1 : 8);
  const [larguraTela, setLarguraTela] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1400);
  const [agora, setAgora] = useState(new Date());

  useEffect(() => {
    async function carregarDados() {
      try {
        const res = await fetch(
          `${API_URL}/api/readings?period=${periodoSelecionado}`
        );
        const data = await res.json();

        setColmeias((prev) => {
          const ultimo = data?.length ? data[data.length - 1] : null;

          return [
            {
              ...prev[0],
              historico: data,
              temperaturaInterna: ultimo ? ultimo.temperaturaInterna : null,
              umidadeInterna: ultimo ? ultimo.umidadeInterna : null,
              temperaturaExterna: ultimo ? ultimo.temperaturaExterna : null,
              umidadeExterna: ultimo ? ultimo.umidadeExterna : null,
              peso: ultimo ? ultimo.peso : null,
              bateria: ultimo ? ultimo.bateria : null,
            },
          ];
        });
      } catch (erro) {
        console.error("Erro ao buscar dados do backend:", erro);
      }
    }

    carregarDados();
    const intervalo = setInterval(carregarDados, INTERVALO_ATUALIZACAO);

    return () => clearInterval(intervalo);
  }, [periodoSelecionado]);

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.background = CORES.fundo;
    document.body.style.overflowX = "hidden";

    return () => {
      document.body.style.margin = "";
      document.body.style.background = "";
      document.body.style.overflowX = "";
    };
  }, []);

  useEffect(() => {
    const onResize = () => setLarguraTela(window.innerWidth);
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const relogio = setInterval(() => setAgora(new Date()), 60000);
    return () => clearInterval(relogio);
  }, []);

  useEffect(() => {
    setLimiteHistorico(larguraTela < 1100 ? 1 : 8);
  }, [periodoSelecionado, larguraTela]);

  const layoutMobile = larguraTela < 1100;

  const limiteInicial = layoutMobile ? 1 : 8;

  const statusTemperaturaInterna = getStatusMetrica(
    "temperaturaInterna",
    colmeiaSelecionada.temperaturaInterna
  );
  const statusUmidadeInterna = getStatusMetrica(
    "umidadeInterna",
    colmeiaSelecionada.umidadeInterna
  );
  const statusTemperaturaExterna = getStatusMetrica(
    "temperaturaExterna",
    colmeiaSelecionada.temperaturaExterna
  );
  const statusUmidadeExterna = getStatusMetrica(
    "umidadeExterna",
    colmeiaSelecionada.umidadeExterna
  );
  const statusBateria = getStatusMetrica(
    "bateria",
    colmeiaSelecionada.bateria
  );

  const historicoFiltrado = useMemo(() => {
    if (!colmeiaSelecionada?.historico) return [];

    return filtrarHistorico(colmeiaSelecionada.historico, periodoSelecionado)
      .map((item) => ({
        ...item,
        dataCompleta: new Date(item.dataCompleta).getTime(),
      }))
      .sort((a, b) => a.dataCompleta - b.dataCompleta);
  }, [colmeiaSelecionada, periodoSelecionado]);

  const historicoVisivel = [...historicoFiltrado].reverse().slice(0, limiteHistorico);

  const statsTempInterna = useMemo(
    () => calcularEstatisticasGrafico(historicoFiltrado, "temperaturaInterna"),
    [historicoFiltrado]
  );
  const statsTempExterna = useMemo(
    () => calcularEstatisticasGrafico(historicoFiltrado, "temperaturaExterna"),
    [historicoFiltrado]
  );
  const statsUmidadeInterna = useMemo(
    () => calcularEstatisticasGrafico(historicoFiltrado, "umidadeInterna"),
    [historicoFiltrado]
  );
  const statsUmidadeExterna = useMemo(
    () => calcularEstatisticasGrafico(historicoFiltrado, "umidadeExterna"),
    [historicoFiltrado]
  );

  const statsGraficoExpandido =
    graficoExpandido && GRAFICOS[graficoExpandido]
      ? calcularEstatisticasGrafico(
          historicoFiltrado,
          GRAFICOS[graficoExpandido]?.dataKey
        )
      : null;

  const tendenciaGraficoExpandido =
    graficoExpandido && GRAFICOS[graficoExpandido]
      ? calcularTendencia(historicoFiltrado, GRAFICOS[graficoExpandido]?.dataKey)
      : null;

  const statusColmeias = useMemo(() => {
    return colmeias.map((colmeia) => {
      const ultimaLeitura = colmeia.historico[colmeia.historico.length - 1] || {};
      const minutosSemAtualizar = diferencaMinutos(agora, ultimaLeitura?.dataCompleta);
      const offline = minutosSemAtualizar > 1;

      return {
        ...colmeia,
        minutosSemAtualizar,
        offline,
      };
    });
  }, [colmeias, agora]);

  const colmeiaSelecionadaStatus = statusColmeias[0];

  const temLeituraAtual =
    colmeiaSelecionada.temperaturaInterna !== null &&
    colmeiaSelecionada.umidadeInterna !== null &&
    colmeiaSelecionada.temperaturaExterna !== null &&
    colmeiaSelecionada.umidadeExterna !== null &&
    colmeiaSelecionada.bateria !== null &&
    colmeiaSelecionada.peso !== null;

  const temDadosTemperaturaInterna = colmeiaSelecionada.temperaturaInterna !== null;
  const temDadosBateria = colmeiaSelecionada.bateria !== null;

  const alertaTemperatura =
    temDadosTemperaturaInterna &&
    (colmeiaSelecionada.temperaturaInterna < LIMITES.temperaturaInterna.min ||
      colmeiaSelecionada.temperaturaInterna > LIMITES.temperaturaInterna.max);

  const alertaBateria =
    temDadosBateria && colmeiaSelecionada.bateria < LIMITES.bateria.critico;

  const colmeiasEmAlerta = statusColmeias.filter((c) => {
    const statusTempInterna = getStatusMetrica("temperaturaInterna", c.temperaturaInterna);
    const statusUmidInterna = getStatusMetrica("umidadeInterna", c.umidadeInterna);
    const statusTempExterna = getStatusMetrica("temperaturaExterna", c.temperaturaExterna);
    const statusUmidExterna = getStatusMetrica("umidadeExterna", c.umidadeExterna);
    const statusBat = getStatusMetrica("bateria", c.bateria);

    return (
      statusTempInterna === "critico" ||
      statusUmidInterna === "critico" ||
      statusTempExterna === "critico" ||
      statusUmidExterna === "critico" ||
      statusBat === "critico" ||
      c.offline
    );
  }).length;

  const tendenciaPeso = calcularTendencia(historicoFiltrado, "peso");

  const insightsGerados = gerarInsights(
    colmeiaSelecionada,
    historicoFiltrado,
    statusTemperaturaInterna,
    statusUmidadeInterna,
    statusBateria,
    tendenciaPeso
  );

  const statusOperacional = getStatusOperacional({
    offline: colmeiaSelecionadaStatus?.offline,
    temLeituraAtual,
    alertaTemperatura,
    alertaBateria,
    statusUmidadeInterna,
    statusTemperaturaExterna,
    statusUmidadeExterna,
  });

  const descricaoStatusOperacional = getDescricaoStatusOperacional({
    offline: colmeiaSelecionadaStatus?.offline,
    temLeituraAtual,
    alertaTemperatura,
    alertaBateria,
    statusUmidadeInterna,
    statusTemperaturaExterna,
    statusUmidadeExterna,
  });

  const statusSidebarAtual = getStatusSidebarColmeia({
    offline: colmeiaSelecionadaStatus?.offline,
    temLeituraAtual,
    alertaTemperatura,
    alertaBateria,
    statusUmidadeInterna,
    statusTemperaturaExterna,
    statusUmidadeExterna,
  });

  return (
    <div className={`mms-app ${layoutMobile ? "is-mobile" : ""}`}>
      {layoutMobile && (
        <button
          className="mms-menu-button"
          onClick={() => setMenuAberto(!menuAberto)}
        >
          {menuAberto ? "Fechar menu" : "Abrir menu"}
        </button>
      )}

      {(!layoutMobile || menuAberto) && (
        <aside className="mms-sidebar">
          <div>
            <h1 className="mms-sidebar__title">MMS</h1>
            <p className="mms-sidebar__subtitle">Sistema de Monitoramento</p>
          </div>

          <div className="mms-sidebar__section">
            <p className="mms-section-label">COLMEIA</p>

            <div className="mms-colmeias-lista">
              <div
                style={{
                  ...S.sidebarCardBase,
                  ...S.sidebarCardAtivo,
                  cursor: "default",
                }}
              >
                <div style={S.sidebarCardTop}>
                  <strong style={{ fontSize: "15px", color: "#ffffff" }}>
                    {colmeiaSelecionada.nome}
                  </strong>

                  <span
                    style={{
                      ...S.statusPill,
                      background: statusSidebarAtual.background,
                      color: statusSidebarAtual.color,
                    }}
                  >
                    {statusSidebarAtual.label}
                  </span>
                </div>

                <span style={S.sidebarMeta}>
                  {colmeiaSelecionada.codigo} • {colmeiaSelecionada.especie}
                </span>
              </div>
            </div>
          </div>
        </aside>
      )}

      <main className="mms-main">
        <HeaderSection colmeiasEmAlerta={colmeiasEmAlerta} />

        <HeroSection
          layoutMobile={layoutMobile}
          colmeiaSelecionada={colmeiaSelecionada}
          periodoSelecionado={periodoSelecionado}
          statusOperacional={statusOperacional}
          descricaoStatusOperacional={descricaoStatusOperacional}
        />

        <ToolbarPeriodo
          periodoSelecionado={periodoSelecionado}
          setPeriodoSelecionado={setPeriodoSelecionado}
        />

        {colmeiaSelecionadaStatus?.offline && (
          <section
            style={{
              marginBottom: "24px",
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              color: "#9f1239",
              padding: "14px 16px",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#e11d48",
                display: "inline-block",
              }}
            />
            Colmeia sem atualização há {colmeiaSelecionadaStatus.minutosSemAtualizar} min.
          </section>
        )}

        {(alertaTemperatura || alertaBateria) && (
          <section className="mms-alert-box">
            <strong>Atenção:</strong>{" "}
            {alertaTemperatura && "temperatura interna acima do ideal. "}
            {alertaBateria && "bateria abaixo do nível recomendado."}
          </section>
        )}

        <section style={{ marginBottom: "10px", marginTop: "10px" }}>
          <div style={{ marginBottom: "18px" }}>
            <div className="mms-unified-title">
              <span className="mms-unified-title__dot"></span>
              <h3 className="mms-unified-title__text is-section">
                Condições atuais da colmeia
              </h3>
            </div>
          </div>
        </section>

        <section className="mms-reading-groups">
          <div className="mms-reading-group">
            <div className="mms-reading-group__header">
              <div className="mms-unified-title">
                <span className="mms-unified-title__dot"></span>
                <h4 className="mms-unified-title__text is-group">Ambiente interno</h4>
              </div>

              <span className="mms-reading-group__tag">Colmeia</span>
            </div>

            <div style={cardsGrid(layoutMobile)}>
              <MetricCard
                titulo="Temperatura interna"
                valor={
                  colmeiaSelecionada.temperaturaInterna !== null
                    ? `${colmeiaSelecionada.temperaturaInterna} °C`
                    : "--"
                }
                status={statusTemperaturaInterna}
              />

              <MetricCard
                titulo="Umidade interna"
                valor={
                  colmeiaSelecionada.umidadeInterna !== null
                    ? `${colmeiaSelecionada.umidadeInterna} %`
                    : "--"
                }
                status={statusUmidadeInterna}
              />
            </div>
          </div>

          <div className="mms-reading-group">
            <div className="mms-reading-group__header">
              <div className="mms-unified-title">
                <span className="mms-unified-title__dot"></span>
                <h4 className="mms-unified-title__text is-group">Ambiente externo</h4>
              </div>

              <span className="mms-reading-group__tag">Ambiente</span>
            </div>

            <div style={cardsGrid(layoutMobile)}>
              <MetricCard
                titulo="Temperatura externa"
                valor={
                  colmeiaSelecionada.temperaturaExterna !== null
                    ? `${colmeiaSelecionada.temperaturaExterna} °C`
                    : "--"
                }
                status={statusTemperaturaExterna}
              />

              <MetricCard
                titulo="Umidade externa"
                valor={
                  colmeiaSelecionada.umidadeExterna !== null
                    ? `${colmeiaSelecionada.umidadeExterna} %`
                    : "--"
                }
                status={statusUmidadeExterna}
              />
            </div>
          </div>

          <div className="mms-reading-group">
            <div className="mms-reading-group__header">
              <div className="mms-unified-title">
                <span className="mms-unified-title__dot"></span>
                <h4 className="mms-unified-title__text is-group">Sistema</h4>
              </div>

              <span className="mms-reading-group__tag">Operação</span>
            </div>

            <div style={cardsGrid(layoutMobile)}>
              <MetricCard
                titulo="Peso"
                valor={
                  colmeiaSelecionada.peso !== null
                    ? `${colmeiaSelecionada.peso} kg`
                    : "--"
                }
              />

              <MetricCard
                titulo="Bateria"
                valor={
                  colmeiaSelecionada.bateria !== null
                    ? `${colmeiaSelecionada.bateria} V`
                    : "--"
                }
                status={statusBateria}
              />
            </div>
          </div>
        </section>

        <section className="mms-grid-2">
          <GraficoComparativoPanel
            titulo="Temperatura"
            tag={periodoTexto(periodoSelecionado)}
            modo={modoTemperatura}
            setModo={setModoTemperatura}
            tipo="temperatura"
            dados={historicoFiltrado}
            onExpand={() => setGraficoExpandido("temperaturaComparativa")}
            statsInterna={statsTempInterna}
            statsExterna={statsTempExterna}
          />

          <GraficoComparativoPanel
            titulo="Umidade"
            tag={periodoTexto(periodoSelecionado)}
            modo={modoUmidade}
            setModo={setModoUmidade}
            tipo="umidade"
            dados={historicoFiltrado}
            onExpand={() => setGraficoExpandido("umidadeComparativa")}
            statsInterna={statsUmidadeInterna}
            statsExterna={statsUmidadeExterna}
          />
        </section>

        <section className="mms-grid-2-bottom">
          <div className="mms-panel">
            <div className="mms-panel__header">
              <div className="mms-title-row">
                <span className="mms-title-row__accent"></span>
                <h3 className="mms-title-row__text">Histórico de leituras</h3>
              </div>

              <span className="mms-panel__tag">{historicoFiltrado.length} leituras</span>
            </div>

            <div className="mms-table-wrapper">
              {layoutMobile ? (
                <div className="mms-history-cards">
                  {historicoVisivel.map((item, index) => {
                    const statusTempInterna = getStatusMetrica(
                      "temperaturaInterna",
                      item.temperaturaInterna
                    );
                    const statusUmidInterna = getStatusMetrica(
                      "umidadeInterna",
                      item.umidadeInterna
                    );
                    const statusTempExterna = getStatusMetrica(
                      "temperaturaExterna",
                      item.temperaturaExterna
                    );
                    const statusUmidExterna = getStatusMetrica(
                      "umidadeExterna",
                      item.umidadeExterna
                    );
                    const statusBat = getStatusMetrica("bateria", item.bateria);

                    return (
                      <div key={index} className="mms-history-card">
                        <div className="mms-history-card__time">{item.hora}</div>

                        <div className="mms-history-card__grid">
                          <div className="mms-history-card__item">
                            <span className="mms-history-card__label">Temp. interna</span>
                            <span className="mms-history-card__value">
                              <span style={getCellStatusStyle(statusTempInterna)}>
                                {item.temperaturaInterna} °C
                              </span>
                            </span>
                          </div>

                          <div className="mms-history-card__item">
                            <span className="mms-history-card__label">Umid. interna</span>
                            <span className="mms-history-card__value">
                              <span style={getCellStatusStyle(statusUmidInterna)}>
                                {item.umidadeInterna} %
                              </span>
                            </span>
                          </div>

                          <div className="mms-history-card__item">
                            <span className="mms-history-card__label">Temp. externa</span>
                            <span className="mms-history-card__value">
                              <span style={getCellStatusStyle(statusTempExterna)}>
                                {item.temperaturaExterna} °C
                              </span>
                            </span>
                          </div>

                          <div className="mms-history-card__item">
                            <span className="mms-history-card__label">Umid. externa</span>
                            <span className="mms-history-card__value">
                              <span style={getCellStatusStyle(statusUmidExterna)}>
                                {item.umidadeExterna} %
                              </span>
                            </span>
                          </div>

                          <div className="mms-history-card__item">
                            <span className="mms-history-card__label">Peso</span>
                            <span className="mms-history-card__value">
                              <span style={getPesoCellStyle()}>{item.peso} kg</span>
                            </span>
                          </div>

                          <div className="mms-history-card__item">
                            <span className="mms-history-card__label">Bateria</span>
                            <span className="mms-history-card__value">
                              <span style={getCellStatusStyle(statusBat)}>
                                {item.bateria} V
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {historicoFiltrado.length > 8 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "8px",
                      }}
                    >
                      <button
                        onClick={() =>
                          setLimiteHistorico((prev) =>
                            prev >= historicoFiltrado.length
                            ? limiteInicial
                            : historicoFiltrado.length
                          )
                        }
                        style={{
                          border: `1px solid ${CORES.borda}`,
                          background: "#ffffff",
                          color: CORES.texto,
                          borderRadius: "10px",
                          padding: "10px 16px",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: "bold",
                        }}
                      >
                        {limiteHistorico >= historicoFiltrado.length
                          ? "Ver menos"
                          : "Ver mais"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <table className="mms-table">
                    <thead>
                      <tr>
                        <th style={S.th}>Hora</th>
                        <th style={S.th}>Temp. int.</th>
                        <th style={S.th}>Umid. int.</th>
                        <th style={S.th}>Temp. ext.</th>
                        <th style={S.th}>Umid. ext.</th>
                        <th style={S.th}>Peso</th>
                        <th style={S.th}>Bateria</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicoVisivel.map((item, index) => {
                        const statusTempInterna = getStatusMetrica(
                          "temperaturaInterna",
                          item.temperaturaInterna
                        );
                        const statusUmidInterna = getStatusMetrica(
                          "umidadeInterna",
                          item.umidadeInterna
                        );
                        const statusTempExterna = getStatusMetrica(
                          "temperaturaExterna",
                          item.temperaturaExterna
                        );
                        const statusUmidExterna = getStatusMetrica(
                          "umidadeExterna",
                          item.umidadeExterna
                        );
                        const statusBat = getStatusMetrica("bateria", item.bateria);

                        return (
                          <tr key={index}>
                            <td style={S.td}>{item.hora}</td>
                            <td style={S.td}>
                              <span style={getCellStatusStyle(statusTempInterna)}>
                                {item.temperaturaInterna} °C
                              </span>
                            </td>
                            <td style={S.td}>
                              <span style={getCellStatusStyle(statusUmidInterna)}>
                                {item.umidadeInterna} %
                              </span>
                            </td>
                            <td style={S.td}>
                              <span style={getCellStatusStyle(statusTempExterna)}>
                                {item.temperaturaExterna} °C
                              </span>
                            </td>
                            <td style={S.td}>
                              <span style={getCellStatusStyle(statusUmidExterna)}>
                                {item.umidadeExterna} %
                              </span>
                            </td>
                            <td style={S.td}>
                              <span style={getPesoCellStyle()}>{item.peso} kg</span>
                            </td>
                            <td style={S.td}>
                              <span style={getCellStatusStyle(statusBat)}>
                                {item.bateria} V
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {historicoFiltrado.length > 8 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "16px",
                      }}
                    >
                      <button
                        onClick={() =>
                          setLimiteHistorico((prev) =>
                            prev >= historicoFiltrado.length
                            ? limiteInicial
                            : historicoFiltrado.length
                          )
                        }
                        style={{
                          border: `1px solid ${CORES.borda}`,
                          background: "#ffffff",
                          color: CORES.texto,
                          borderRadius: "10px",
                          padding: "10px 16px",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: "bold",
                        }}
                      >
                        {limiteHistorico >= historicoFiltrado.length
                          ? "Ver menos"
                          : "Ver mais"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="mms-panel">
            <div className="mms-panel__header">
              <div className="mms-title-row">
                <span className="mms-title-row__accent"></span>
                <h3 className="mms-title-row__text">Resumo operacional</h3>
              </div>

              <span className="mms-panel__tag"></span>
            </div>

            <div className="mms-summary-list">
              <SummaryRow label="Colmeias monitoradas" value={String(colmeias.length)} />
              <SummaryRow label="Colmeias em alerta" value={String(colmeiasEmAlerta)} />
              <SummaryRow label="Espécie atual" value={colmeiaSelecionada.especie} />
              <SummaryRow label="Período" value={periodoTexto(periodoSelecionado)} />
              <SummaryRow
                label="Tendência do peso"
                value={tendenciaPeso ? tendenciaPeso : "--"}
              />
            </div>

            <div className="mms-insights-box">
              {insightsGerados.map((insight, index) => (
                <InsightItem key={index} titulo={insight.titulo} texto={insight.texto} />
              ))}
            </div>
          </div>
        </section>

        {graficoExpandido && (
          <div className="mms-modal-overlay" onClick={() => setGraficoExpandido(null)}>
            <div className="mms-modal-content" onClick={(e) => e.stopPropagation()}>
              <div style={S.modalHeader}>
                <div>
                  <h2 style={S.modalTitle}>
                    {graficoExpandido === "temperaturaComparativa"
                      ? "Histórico comparativo de temperatura"
                      : graficoExpandido === "umidadeComparativa"
                      ? "Histórico comparativo de umidade"
                      : tituloGrafico(graficoExpandido)}
                  </h2>

                  <p style={S.modalSubtitle}>
                    {colmeiaSelecionada.nome} • {colmeiaSelecionada.especie} •{" "}
                    {periodoTexto(periodoSelecionado)}
                  </p>
                </div>

                <button style={S.closeButton} onClick={() => setGraficoExpandido(null)}>
                  Fechar
                </button>
              </div>

              <div
                className="mms-modal-top-cards"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "12px",
                }}
              >
                <div className="mms-modal-mini-card">
                  <span>Colmeia</span>
                  <strong>{colmeiaSelecionada.nome}</strong>
                </div>

                <div className="mms-modal-mini-card">
                  <span>Período</span>
                  <strong>{periodoTexto(periodoSelecionado)}</strong>
                </div>
              </div>

              <div className="mms-chart-body mms-chart-body--expanded">
                {graficoExpandido === "temperaturaComparativa" ? (
                  <>
                    <div className="mms-compare-stats mms-compare-stats--expanded">
                      <div className="mms-compare-stat-card">
                        <span>Temperatura interna</span>
                        <strong>
                          Média:{" "}
                          {formatarValorGrafico(
                            statsTempInterna?.media,
                            "temperaturaInterna"
                          )}
                        </strong>
                        <small>
                          Mín:{" "}
                          {formatarValorGrafico(
                            statsTempInterna?.min?.valor,
                            "temperaturaInterna"
                          )}{" "}
                          • Máx:{" "}
                          {formatarValorGrafico(
                            statsTempInterna?.max?.valor,
                            "temperaturaInterna"
                          )}
                        </small>
                      </div>

                      <div className="mms-compare-stat-card">
                        <span>Temperatura externa</span>
                        <strong>
                          Média:{" "}
                          {formatarValorGrafico(
                            statsTempExterna?.media,
                            "temperaturaExterna"
                          )}
                        </strong>
                        <small>
                          Mín:{" "}
                          {formatarValorGrafico(
                            statsTempExterna?.min?.valor,
                            "temperaturaExterna"
                          )}{" "}
                          • Máx:{" "}
                          {formatarValorGrafico(
                            statsTempExterna?.max?.valor,
                            "temperaturaExterna"
                          )}
                        </small>
                      </div>
                    </div>

                    <RenderGraficoComparativo
                      tipo="temperatura"
                      dados={historicoFiltrado}
                      modo={modoTemperatura}
                      altura={440}
                      expandido={true}
                    />
                  </>
                ) : graficoExpandido === "umidadeComparativa" ? (
                  <>
                    <div className="mms-compare-stats mms-compare-stats--expanded">
                      <div className="mms-compare-stat-card">
                        <span>Umidade interna</span>
                        <strong>
                          Média:{" "}
                          {formatarValorGrafico(
                            statsUmidadeInterna?.media,
                            "umidadeInterna"
                          )}
                        </strong>
                        <small>
                          Mín:{" "}
                          {formatarValorGrafico(
                            statsUmidadeInterna?.min?.valor,
                            "umidadeInterna"
                          )}{" "}
                          • Máx:{" "}
                          {formatarValorGrafico(
                            statsUmidadeInterna?.max?.valor,
                            "umidadeInterna"
                          )}
                        </small>
                      </div>

                      <div className="mms-compare-stat-card">
                        <span>Umidade externa</span>
                        <strong>
                          Média:{" "}
                          {formatarValorGrafico(
                            statsUmidadeExterna?.media,
                            "umidadeExterna"
                          )}
                        </strong>
                        <small>
                          Mín:{" "}
                          {formatarValorGrafico(
                            statsUmidadeExterna?.min?.valor,
                            "umidadeExterna"
                          )}{" "}
                          • Máx:{" "}
                          {formatarValorGrafico(
                            statsUmidadeExterna?.max?.valor,
                            "umidadeExterna"
                          )}
                        </small>
                      </div>
                    </div>

                    <RenderGraficoComparativo
                      tipo="umidade"
                      dados={historicoFiltrado}
                      modo={modoUmidade}
                      altura={440}
                      expandido={true}
                    />
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: layoutMobile
                          ? "1fr"
                          : "repeat(5, 1fr)",
                        gap: "12px",
                        marginBottom: "18px",
                      }}
                    >
                      <div className="mms-modal-mini-card">
                        <span>Último valor</span>
                        <strong>
                          {formatarValorGrafico(
                            statsGraficoExpandido?.ultimo?.valor,
                            graficoExpandido
                          )}
                        </strong>
                      </div>

                      <div className="mms-modal-mini-card">
                        <span>Média</span>
                        <strong>
                          {formatarValorGrafico(
                            statsGraficoExpandido?.media,
                            graficoExpandido
                          )}
                        </strong>
                      </div>

                      <div className="mms-modal-mini-card">
                        <span>Mínimo</span>
                        <strong>
                          {formatarValorGrafico(
                            statsGraficoExpandido?.min?.valor,
                            graficoExpandido
                          )}
                        </strong>
                      </div>

                      <div className="mms-modal-mini-card">
                        <span>Máximo</span>
                        <strong>
                          {formatarValorGrafico(
                            statsGraficoExpandido?.max?.valor,
                            graficoExpandido
                          )}
                        </strong>
                      </div>

                      <div className="mms-modal-mini-card">
                        <span>Tendência</span>
                        <strong>{tendenciaGraficoExpandido || "--"}</strong>
                      </div>
                    </div>

                    <RenderGrafico
                      tipo={graficoExpandido}
                      dados={historicoFiltrado}
                      altura={440}
                      expandido={true}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

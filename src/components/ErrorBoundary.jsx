import { Component } from "react";

// Si una pantalla falla, muestra un mensaje en vez de dejar la página en blanco.
class ErrorBoundary extends Component {
  state = { fallo: false };

  static getDerivedStateFromError() {
    return { fallo: true };
  }

  componentDidCatch(error) {
    console.error("Error inesperado en la interfaz:", error);
  }

  render() {
    if (!this.state.fallo) return this.props.children;
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-fondo p-6 text-center text-texto">
        <h1 className="text-2xl font-extrabold">Algo salió mal</h1>
        <p className="max-w-sm text-texto-2">Ocurrió un error inesperado. Recarga la página para continuar.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="h-12 cursor-pointer rounded-full bg-primario px-6 font-bold text-sobre-primario"
        >
          Recargar
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;

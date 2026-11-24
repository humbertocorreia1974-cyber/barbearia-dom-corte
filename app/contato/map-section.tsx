'use client';

import { useEffect, useState } from 'react';
import MapView, { type MapPoint } from '@/components/map-view';

type Props = {
  endereco: string;
  nomeNegocio: string;
};

type Geo = { lat: number; lng: number; displayName: string };

export function MapSection({ endereco, nomeNegocio }: Props) {
  const [geo, setGeo] = useState<Geo | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    async function run() {
      setCarregando(true);
      setErro(null);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(endereco)}`);
        const data = (await res.json().catch(() => ({}))) as Partial<Geo> & { error?: string };
        if (cancelado) return;
        if (!res.ok || typeof data.lat !== 'number' || typeof data.lng !== 'number') {
          setErro(data.error || 'Nao foi possivel localizar o endereco no mapa.');
        } else {
          setGeo({
            lat: data.lat,
            lng: data.lng,
            displayName: data.displayName || endereco,
          });
        }
      } catch {
        if (!cancelado) setErro('Falha ao carregar o mapa.');
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }
    if (endereco) run();
    else {
      setCarregando(false);
      setErro('Endereco ainda nao cadastrado.');
    }
    return () => {
      cancelado = true;
    };
  }, [endereco]);

  if (carregando) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl border border-border bg-surface text-sm text-fg-muted">
        Carregando mapa...
      </div>
    );
  }

  if (erro || !geo) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-6 text-center">
        <p className="text-sm text-fg-muted">{erro || 'Mapa indisponivel.'}</p>
        <a
          href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(endereco)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-brand underline-offset-2 hover:underline"
        >
          Abrir no OpenStreetMap
        </a>
      </div>
    );
  }

  const points: MapPoint[] = [
    {
      id: 'loja',
      lat: geo.lat,
      lng: geo.lng,
      title: nomeNegocio,
      subtitle: endereco,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <MapView points={points} center={[geo.lat, geo.lng]} zoom={16} />
    </div>
  );
}

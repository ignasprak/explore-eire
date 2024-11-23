"use client"

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY || 'pk.eyJ1IjoiaHVudGhhd2sxMSIsImEiOiJjbTN1anQ5a2wwa3BuMmxzN2k2bXhucnc2In0.MtdX1gZtTkXvDtb1RxWtuA';

const Map = () => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (mapContainerRef.current) {
            const map = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [-8.24389, 53.41291],
                zoom: 6.5,
            });

            return () => map.remove();
        }
    }, []);

    return <div ref={mapContainerRef} className="w-full h-[56.5rem]" />;
};

export default Map;
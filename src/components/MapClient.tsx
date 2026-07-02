'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet's default marker icon paths (broken in Next.js/webpack by default)
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface MapClientProps {
  location: string
}

// Component to dynamically re-center the map when coordinates change
function MapRecenter({ lat, lng }: { lat: number, lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng])
  }, [lat, lng, map])
  return null
}

// Component to fix the 'patchy map' bug caused by initializing inside a hidden tab
function MapResizer() {
  const map = useMap()
  useEffect(() => {
    // Invalidate size after a short delay to account for CSS transitions/tab switching
    const timeout = setTimeout(() => {
      map.invalidateSize()
    }, 400)
    
    // Watch for actual container resize events
    const observer = new ResizeObserver(() => {
      map.invalidateSize()
    })
    
    const container = map.getContainer()
    if (container) {
      observer.observe(container)
    }
    
    return () => {
      clearTimeout(timeout)
      observer.disconnect()
    }
  }, [map])
  return null
}

export default function MapClient({ location }: MapClientProps) {
  // Default to Nairobi, Kenya
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: -1.2921, lng: 36.8219 })

  useEffect(() => {
    async function fetchCoordinates() {
      if (!location) return
      
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&format=json`)
        const data = await res.json()
        
        if (data && data.results && data.results.length > 0) {
          setCoords({
            lat: data.results[0].latitude,
            lng: data.results[0].longitude
          })
        }
      } catch (error) {
        console.error('Geocoding failed:', error)
      }
    }

    fetchCoordinates()
  }, [location])

  return (
    <MapContainer
      center={[coords.lat, coords.lng]}
      zoom={13}
      scrollWheelZoom={false}
      style={{ width: '100%', height: '100%', borderRadius: '10px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapResizer />
      <MapRecenter lat={coords.lat} lng={coords.lng} />
      <Marker position={[coords.lat, coords.lng]} icon={defaultIcon}>
        <Popup>{location}</Popup>
      </Marker>
    </MapContainer>
  )
}

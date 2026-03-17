import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  BedDouble, 
  Square, 
  Home, 
  ArrowLeft, 
  Camera, 
  Box, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Upload,
  Trash2,
  RefreshCw,
  Euro,
  ChevronRight
} from 'lucide-react';
import api from '../../services/api';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, PerspectiveCamera } from '@react-three/drei';

// Composant 3D basique pour le fallback
const Model = () => {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="indigo" />
    </mesh>
  );
};

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('info'); // info, photos, 3d

  const fetchProperty = async () => {
    try {
      const response = await api.get(`/api/immobilier/biens/${id}/`);
      setProperty(response.data);
    } catch (error) {
      console.error('Erreur détail bien:', error);
      // Mock pour démo
      setProperty({
        id,
        name: 'Appartement T3 - Lyon 6',
        address: '12 Rue de la Paix, 69006 Lyon',
        type: 'Appartement',
        surface: 75,
        rooms: 3,
        status: 'OCCUPIED',
        price: 1250,
        description: 'Magnifique appartement T3 rénové avec goà»t, situé au coeur du 6ème arrondissement. Proche de toutes commodités et du parc de la Tàªte d\'Or.',
        tour_3d_url: 'https://my.matterport.com/show/?m=sx976m8mX5B', // Exemple Matterport
        photos: [
          { id: 1, image: 'https://picsum.photos/seed/prop1/800/600', is_main: true },
          { id: 2, image: 'https://picsum.photos/seed/prop2/800/600', is_main: false },
          { id: 3, image: 'https://picsum.photos/seed/prop3/800/600', is_main: false },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try {
      await api.post(`/api/immobilier/biens/${id}/statut/`, { status: newStatus });
      setProperty(prev => ({ ...prev, status: newStatus }));
      setUploadMessage({ type: 'success', text: `Statut mis à  jour : ${newStatus}` });
      setTimeout(() => setUploadMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Erreur statut:', error);
      setUploadMessage({ type: 'error', text: 'Erreur lors du changement de statut.' });
      setTimeout(() => setUploadMessage({ type: '', text: '' }), 3000);
    } finally {
      setStatusLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = e.target.files;
    if (!files || !files.length) return;

    setUploading(true);
    setUploadMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('image', files[0]);
    formData.append('is_main', 'false');
    formData.append('display_order', '0');

    try {
      await api.post(`/api/immobilier/biens/${id}/photos/`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data' 
        }
      });
      
      setUploadMessage({ type: 'success', text: 'Photo ajoutée avec succès !' });
      await fetchProperty();
      
      // Effacer le message après 3 secondes
      setTimeout(() => setUploadMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Erreur upload:', error);
      setUploadMessage({ type: 'error', text: 'Erreur lors de l\'envoi de la photo.' });
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <Loader2 className="animate-spin text-indigo-600" size={48} />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/dashboard/properties')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors"
        >
          <ArrowLeft size={20} />
          Retour à  la liste
        </button>
        <div className="flex gap-3 items-center">
          {statusLoading && <Loader2 className="animate-spin text-indigo-600" size={20} />}
          <button 
            onClick={() => handleStatusChange('VACANT')}
            disabled={statusLoading}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              property.status === 'VACANT' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            } disabled:opacity-50`}
          >
            Disponible
          </button>
          <button 
            onClick={() => handleStatusChange('OCCUPIED')}
            disabled={statusLoading}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              property.status === 'OCCUPIED' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            } disabled:opacity-50`}
          >
            Loué
          </button>
          <button 
            onClick={() => handleStatusChange('MAINTENANCE')}
            disabled={statusLoading}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              property.status === 'MAINTENANCE' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            } disabled:opacity-50`}
          >
            Maintenance
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info & Tabs */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-[2.5rem] p-8 shadow-sm">
            <h1 className="text-4xl font-black text-slate-900 mb-4">{property.name}</h1>
            <div className="flex items-center gap-2 text-slate-500 font-medium mb-8">
              <MapPin size={18} />
              {property.address}
            </div>

            <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit mb-8">
              {[
                { id: 'info', label: 'Informations', icon: Home },
                { id: 'photos', label: 'Photos', icon: Camera },
                { id: '3d', label: 'Visite 3D', icon: Box },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'info' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-3 gap-6">
                  <div className="p-6 bg-slate-50 rounded-3xl text-center">
                    <Square size={24} className="text-indigo-600 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-400 uppercase">Surface</p>
                    <p className="text-xl font-black text-slate-900">{property.surface} m²</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl text-center">
                    <BedDouble size={24} className="text-indigo-600 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-400 uppercase">Pièces</p>
                    <p className="text-xl font-black text-slate-900">{property.rooms} p.</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl text-center">
                    <Euro size={24} className="text-indigo-600 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-400 uppercase">Loyer HC</p>
                    <p className="text-xl font-black text-slate-900">{property.price} €</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Description</h3>
                  <p className="text-slate-600 leading-relaxed">{property.description}</p>
                </div>
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Galerie Photos</h3>
                  <div className="flex items-center gap-4">
                    {uploadMessage.text && (
                      <span className={`text-xs font-bold px-3 py-1 rounded-lg animate-in fade-in slide-in-from-right-2 ${
                        uploadMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {uploadMessage.text}
                      </span>
                    )}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                      {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                      Ajouter une photo
                    </button>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.photos?.map((photo) => (
                    <div key={photo.id} className="relative aspect-square rounded-2xl overflow-hidden group">
                      <img 
                        src={photo.image} 
                        alt="Property" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button className="p-2 bg-white text-slate-900 rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                          <CheckCircle2 size={18} />
                        </button>
                        <button className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                      {photo.is_main && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-md uppercase">
                          Principale
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === '3d' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Visite Immersive</h3>
                  <button className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline">
                    <RefreshCw size={16} />
                    Mettre à  jour le lien
                  </button>
                </div>

                <div className="aspect-video bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl relative">
                  {property.tour_3d_url ? (
                    <iframe 
                      src={property.tour_3d_url}
                      className="w-full h-full border-0"
                      allowFullScreen
                      allow="xr-spatial-tracking"
                    />
                  ) : (
                    <div className="w-full h-full">
                      <Canvas>
                        <PerspectiveCamera makeDefault position={[3, 3, 3]} />
                        <OrbitControls autoRotate />
                        <Stage environment="city" intensity={0.6}>
                          <Model />
                        </Stage>
                      </Canvas>
                      <div className="absolute bottom-6 left-6 bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                        <p className="text-white text-xs font-bold uppercase tracking-widest">Aperçu Loxis 3D Engine</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Stats & Actions */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-xl text-white">
            <h3 className="text-xl font-bold mb-6">Statut Locatif</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Locataire</p>
                    <p className="font-bold">Alice Martin</p>
                  </div>
                </div>
                <button className="text-indigo-400 hover:text-indigo-300">
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                    <Euro size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Dernier Loyer</p>
                    <p className="font-bold">Payé (Mars)</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400">OK</span>
              </div>
            </div>

            <button className="w-full mt-8 py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-indigo-50 transition-all shadow-xl">
              Gérer le bail
            </button>
          </div>

          <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="text-amber-500" size={24} />
              <h3 className="text-xl font-bold text-slate-900">Maintenance</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-sm font-bold text-slate-900 mb-1">Entretien chaudière</p>
                <p className="text-xs text-slate-500">Prévu pour le 25 Mars 2026</p>
              </div>
              <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-sm font-bold text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-all">
                + Signaler un incident
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;

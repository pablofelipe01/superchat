'use client';

/**
 * 🌱 Sirius Regenerative Solutions - Video Platform Homepage
 * Where technology meets agricultural wisdom
 */

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - El Claro Digital */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Hero Content */}
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Sirius Logo Area */}
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full glass-leaf mb-6 animate-[photosynthesis-glow_6s_ease-in-out_infinite] p-2">
              <img 
                src="/logo-sirius.png" 
                alt="Sirius Regenerative Solutions" 
                className="w-full h-full object-contain filter drop-shadow-lg"
              />
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Sirius Regenerative
              </span>
              <br />
              <span className="text-2xl sm:text-3xl lg:text-4xl font-normal text-muted-foreground">
                Video Platform
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Donde la tecnología encuentra la agricultura regenerativa. 
              Conectamos ecosistemas digitales con la sabiduría de la naturaleza.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <button 
              onClick={() => {
                window.location.href = '/login';
              }}
              className="group relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                🔐 Acceso Empleados
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            
            <button 
              onClick={() => {
                window.location.href = '/simple-meeting';
              }}
              className="group bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/20 hover:border-secondary/40 px-8 py-4 rounded-full font-medium transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                🎥 Demo Directo
              </span>
            </button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 pt-16 max-w-5xl mx-auto">
            {/* SIRIUS AI Card */}
            <div className="glass-leaf p-6 rounded-2xl hover:scale-105 transition-transform duration-300">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">SIRIUS Assistant</h3>
              <p className="text-muted-foreground text-sm">
                IA especializada en agricultura regenerativa que te acompaña en cada reunión
              </p>
            </div>

            {/* Carbon Impact Card */}
            <div className="glass-leaf p-6 rounded-2xl hover:scale-105 transition-transform duration-300">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Impacto de Carbono</h3>
              <p className="text-muted-foreground text-sm">
                Cada videollamada cuenta: calculamos el CO₂ ahorrado vs. viajes físicos
              </p>
            </div>

            {/* Natural UX Card */}
            <div className="glass-leaf p-6 rounded-2xl hover:scale-105 transition-transform duration-300">
              <div className="text-4xl mb-4">🍃</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Experiencia Natural</h3>
              <p className="text-muted-foreground text-sm">
                Interfaz orgánica que respira como un ecosistema vivo
              </p>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="animate-[leaf-flutter_8s_ease-in-out_infinite] absolute top-1/4 left-1/4 w-3 h-3 bg-secondary/30 rounded-full" />
          <div className="animate-[leaf-flutter_12s_ease-in-out_infinite] absolute top-1/3 right-1/4 w-2 h-2 bg-accent/40 rounded-full" style={{ animationDelay: '4s' }} />
          <div className="animate-[leaf-flutter_10s_ease-in-out_infinite] absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-primary/20 rounded-full" style={{ animationDelay: '8s' }} />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 glass-water">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">0</div>
              <div className="text-sm text-muted-foreground">Reuniones Completadas</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-secondary">0 kg</div>
              <div className="text-sm text-muted-foreground">CO₂ Ahorrado</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-accent">0</div>
              <div className="text-sm text-muted-foreground">Árboles Equivalentes</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Ecosistema Activo</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full glass-leaf p-1">
                <img 
                  src="/logo-sirius.png" 
                  alt="Sirius Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-semibold text-foreground">Sirius Regenerative Solutions</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>🌱 Agricultura Regenerativa</span>
              <span>🌍 Sostenibilidad Digital</span>
              <span>🚀 Tecnología Natural</span>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border/10 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Sirius Regenerative Solutions. Cultivando el futuro digitalmente.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

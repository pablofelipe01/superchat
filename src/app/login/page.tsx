'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { validateSiriusEmployee, recordEmployeeLogin } from '@/lib/supabase/client'
import type { SiriusEmployee } from '@/types/database'

export default function LoginPage() {
  const [cedula, setCedula] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [employeeData, setEmployeeData] = useState<SiriusEmployee | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Validar empleado de Sirius
      const { data: employee, error: validationError } = await validateSiriusEmployee(cedula)
      
      if (validationError || !employee) {
        setError('Cédula no encontrada o empleado inactivo. Verifique su número de documento.')
        setIsLoading(false)
        return
      }

      // Registrar login exitoso
      await recordEmployeeLogin(cedula)
      
      // Guardar datos del empleado en localStorage para la sesión
      localStorage.setItem('sirius_employee', JSON.stringify(employee))
      localStorage.setItem('sirius_session', Date.now().toString())
      
      // Redirigir al dashboard
      router.push('/dashboard')
      
    } catch (err) {
      setError('Error de conexión. Intente nuevamente.')
      setIsLoading(false)
    }
  }

  const handleCedulaChange = (value: string) => {
    // Solo permitir números
    const numericValue = value.replace(/\D/g, '')
    setCedula(numericValue)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-green-900">
      {/* Background with agricultural pattern */}
      <div 
        className="fixed inset-0 opacity-20 bg-cover bg-center"
        style={{
          backgroundImage: "url('/foto2.jpg')",
          filter: 'brightness(0.3)'
        }}
      />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 mb-4 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
              <span className="text-3xl">🌱</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Sirius Regenerative
            </h1>
            <p className="text-emerald-200">
              Plataforma de Videoconferencia Agrícola
            </p>
          </div>

          {/* Formulario de login */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-6 text-center">
              Acceso para Empleados
            </h2>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="cedula" className="block text-sm font-medium text-emerald-100 mb-2">
                  Número de Cédula
                </label>
                <input
                  id="cedula"
                  type="text"
                  value={cedula}
                  onChange={(e) => handleCedulaChange(e.target.value)}
                  placeholder="Ej: 1006834877"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  required
                  disabled={isLoading}
                  maxLength={12}
                />
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !cedula}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Validando...
                  </div>
                ) : (
                  'Ingresar al Sistema'
                )}
              </button>
            </form>

            {/* Información adicional */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <p className="text-emerald-200 text-sm text-center">
                ⚡ Solo empleados de Sirius pueden acceder
              </p>
              <p className="text-emerald-300 text-xs text-center mt-2">
                Sistema de autenticación simplificado por cédula
              </p>
            </div>
          </div>

          {/* Lista de empleados para desarrollo (solo visible en modo dev) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 bg-black/20 backdrop-blur-md rounded-lg p-4 border border-white/10">
              <details className="text-white">
                <summary className="cursor-pointer text-sm text-emerald-200 mb-2">
                  🔍 Ver empleados registrados (Dev Mode)
                </summary>
                <div className="space-y-1 text-xs">
                  <p className="text-emerald-100">Algunos ejemplos:</p>
                  <p>• 1006834877 - Santiago Amaya</p>
                  <p>• 1006774686 - David Hernandez</p>
                  <p>• 1057014925 - Yesenia Ramirez</p>
                  <p>• 52586323 - Lina Loaiza</p>
                  <p>• 79454772 - Pablo Acebedo</p>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
import { AddProductForm } from '@/components/AddProductForm'
import { useNavigate } from 'react-router-dom'

export function AddProduct() {
  const navigate = useNavigate()

  const handleSuccess = () => {
    // Optionally redirect to products page after successful addition
    // navigate('/products')
  }

  const handleError = (error: string) => {
    console.error('Product addition error:', error)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Add New Product
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Add a new product to your inventory
        </p>
      </div>
      
      <AddProductForm 
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </div>
  )
}

// Login Component Example
// This demonstrates how to use the form system


import { useForm } from '../../hooks/useForm';
import { useAuth } from '../../contexts/AuthContext';

interface AuthFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const LoginForm = ({ onSuccess, onError }: AuthFormProps) => {
  const { login } = useAuth();

  const {
    formState,
    updateField,
    validate,
    setLoading,
    getFieldError,
    isValid,
  } = useForm(
    { email: '', password: '' },
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      await login(formState.data.email, formState.data.password);
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={formState.data.email}
          onChange={(e) => updateField('email', e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${getFieldError('email') ? 'border-red-500' : ''
            }`}
          placeholder="Enter your email"
        />
        {getFieldError('email') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={formState.data.password}
          onChange={(e) => updateField('password', e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${getFieldError('password') ? 'border-red-500' : ''
            }`}
          placeholder="Enter your password"
        />
        {getFieldError('password') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('password')}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={!isValid || formState.loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {formState.loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
};

// Register Component Example
export const RegisterForm = ({ onSuccess, onError }: AuthFormProps) => {
  const { register } = useAuth();

  const {
    formState,
    updateField,
    validate,
    setLoading,
    getFieldError,
    isValid,
  } = useForm(
    {
      email: '',
      password: '',
      fullName: '',
      phone: '',
      houseNumber: '',
      street: '',
      area: '',
      city: '',
      state: '',
      pinCode: '',
    },
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      await register(formState.data);
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={formState.data.fullName}
            onChange={(e) => updateField('fullName', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${getFieldError('fullName') ? 'border-red-500' : ''
              }`}
            placeholder="Enter your full name"
          />
          {getFieldError('fullName') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('fullName')}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={formState.data.email}
            onChange={(e) => updateField('email', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${getFieldError('email') ? 'border-red-500' : ''
              }`}
            placeholder="Enter your email"
          />
          {getFieldError('email') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={formState.data.password}
            onChange={(e) => updateField('password', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${getFieldError('password') ? 'border-red-500' : ''
              }`}
            placeholder="Enter your password"
          />
          {getFieldError('password') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('password')}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            value={formState.data.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${getFieldError('phone') ? 'border-red-500' : ''
              }`}
            placeholder="Enter your phone number"
          />
          {getFieldError('phone') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('phone')}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="houseNumber" className="block text-sm font-medium text-gray-700">
            House Number
          </label>
          <input
            id="houseNumber"
            type="text"
            value={formState.data.houseNumber}
            onChange={(e) => updateField('houseNumber', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${getFieldError('houseNumber') ? 'border-red-500' : ''
              }`}
            placeholder="House number"
          />
          {getFieldError('houseNumber') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('houseNumber')}</p>
          )}
        </div>

        <div>
          <label htmlFor="street" className="block text-sm font-medium text-gray-700">
            Street
          </label>
          <input
            id="street"
            type="text"
            value={formState.data.street}
            onChange={(e) => updateField('street', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${getFieldError('street') ? 'border-red-500' : ''
              }`}
            placeholder="Street name"
          />
          {getFieldError('street') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('street')}</p>
          )}
        </div>

        <div>
          <label htmlFor="area" className="block text-sm font-medium text-gray-700">
            Area
          </label>
          <input
            id="area"
            type="text"
            value={formState.data.area}
            onChange={(e) => updateField('area', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${getFieldError('area') ? 'border-red-500' : ''
              }`}
            placeholder="Area name"
          />
          {getFieldError('area') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('area')}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City
          </label>
          <input
            id="city"
            type="text"
            value={formState.data.city}
            onChange={(e) => updateField('city', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${getFieldError('city') ? 'border-red-500' : ''
              }`}
            placeholder="City name"
          />
          {getFieldError('city') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('city')}</p>
          )}
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            State
          </label>
          <input
            id="state"
            type="text"
            value={formState.data.state}
            onChange={(e) => updateField('state', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${getFieldError('state') ? 'border-red-500' : ''
              }`}
            placeholder="State name"
          />
          {getFieldError('state') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('state')}</p>
          )}
        </div>

        <div>
          <label htmlFor="pinCode" className="block text-sm font-medium text-gray-700">
            PIN Code
          </label>
          <input
            id="pinCode"
            type="text"
            value={formState.data.pinCode}
            onChange={(e) => updateField('pinCode', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${getFieldError('pinCode') ? 'border-red-500' : ''
              }`}
            placeholder="PIN code"
          />
          {getFieldError('pinCode') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('pinCode')}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={!isValid || formState.loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {formState.loading ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  );
};

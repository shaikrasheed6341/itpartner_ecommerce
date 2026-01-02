import { useState, useCallback } from 'react';

// ============================================================================
// FORM HOOK WITH VALIDATION
// ============================================================================

export function useForm<T>(
  initialData: T,
  _schema: any
) {
  const [formState, setFormState] = useState<{
    data: T;
    errors: Record<string, string | undefined>;
    loading: boolean;
    success: boolean;
  }>({
    data: initialData,
    errors: {},
    loading: false,
    success: false,
  });

  // Update form data
  const updateField = useCallback((field: keyof T, value: any) => {
    setFormState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value,
      },
      errors: {
        ...prev.errors,
        [field]: undefined, // Clear error when field is updated
      },
    }));
  }, []);

  // Update multiple fields
  const updateFields = useCallback((updates: Partial<T>) => {
    setFormState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        ...updates,
      },
      errors: {}, // Clear all errors when updating multiple fields
    }));
  }, []);

  // Validate form
  const validate = useCallback(() => {
    // Simple validation - just return true for now
    return true;
  }, []);

  // Validate single field
  const validateField = useCallback((_field: keyof T) => {
    // Simple validation - just return true for now
    return true;
  }, []);

  // Set loading state
  const setLoading = useCallback((loading: boolean) => {
    setFormState(prev => ({ ...prev, loading }));
  }, []);

  // Set success state
  const setSuccess = useCallback((success: boolean) => {
    setFormState(prev => ({ ...prev, success }));
  }, []);

  // Set errors
  const setErrors = useCallback((errors: Record<string, string | undefined>) => {
    setFormState(prev => ({ ...prev, errors }));
  }, []);

  // Reset form
  const reset = useCallback(() => {
    setFormState({
      data: initialData,
      errors: {},
      loading: false,
      success: false,
    });
  }, [initialData]);

  // Get field error
  const getFieldError = useCallback((field: string) => {
    return formState.errors[field];
  }, [formState.errors]);

  // Check if form is valid
  const isValid = Object.keys(formState.errors).length === 0;

  return {
    formState,
    updateField,
    updateFields,
    validate,
    validateField,
    setLoading,
    setSuccess,
    setErrors,
    reset,
    getFieldError,
    isValid,
  };
}

// ============================================================================
// FORM SUBMISSION HOOK
// ============================================================================

export function useFormSubmit<T, R>(
  submitFn: (data: T) => Promise<R>,
  _schema: any
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = useCallback(async (data: T) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await submitFn(data);
      setSuccess(true);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Submission failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [submitFn]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    submit,
    loading,
    error,
    success,
    reset,
  };
}

// ============================================================================
// FIELD HOOK
// ============================================================================

export function useField<T>(
  initialValue: T,
  validation?: (value: T) => string | undefined
) {
  const [value, setValue] = useState<T>(initialValue);
  const [error, setError] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState(false);

  const onChange = useCallback((newValue: T) => {
    setValue(newValue);
    setTouched(true);

    if (validation) {
      const validationError = validation(newValue);
      setError(validationError);
    }
  }, [validation]);

  const onBlur = useCallback(() => {
    setTouched(true);
    if (validation) {
      const validationError = validation(value);
      setError(validationError);
    }
  }, [value, validation]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(undefined);
    setTouched(false);
  }, [initialValue]);

  return {
    value,
    error,
    touched,
    onChange,
    onBlur,
    reset,
    isValid: !error,
  };
}

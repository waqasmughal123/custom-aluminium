# Frontend Components Rules

## Material UI Standards

### Theme Usage
- Always use theme values: `theme.palette.primary.main`
- Use `sx` prop for styling, avoid inline styles
- Follow responsive breakpoints: `xs`, `sm`, `md`, `lg`, `xl`

### Component Patterns

#### 1. Custom Button Component
```typescript
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

interface ButtonProps extends BaseComponentProps, Omit<MuiButtonProps, 'className'> {
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  loading = false,
  ...props
}) => (
  <MuiButton disabled={loading} {...props}>
    {loading ? 'Loading...' : children}
  </MuiButton>
);
```

#### 2. Form Components Structure
```typescript
// forms/[feature]/
// ├── index.ts
// ├── ComponentForm.tsx
// ├── ComponentFormTypes.ts (if complex)
// └── README.md (for complex forms)
```

#### 3. Layout Components
- `Header.tsx` - Navigation with responsive mobile menu
- `Footer.tsx` - Site footer with links and contact info  
- `MainLayout.tsx` - Combines header + content + footer
- `ConditionalLayout.tsx` - Route-based layout switching

#### 4. Layout Standards (CRITICAL)
**NEVER use Grid or Grid2 components for page layouts!**

**✅ Correct Layout Approach:**
```typescript
// Use Box + flexbox for all layouts
<Container maxWidth="lg" sx={{ py: 4 }}>
  <Box 
    sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' },
      gap: 4 
    }}
  >
    <Box sx={{ flex: 1 }}>Main content</Box>
    <Box sx={{ width: { xs: '100%', md: 300 } }}>Sidebar</Box>
  </Box>
</Container>

// Use Stack for simple arrangements
<Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
  <Box>Item 1</Box>
  <Box>Item 2</Box>
</Stack>
```

**❌ FORBIDDEN Layout Approach:**
```typescript
// NEVER use Grid components for layouts
<Grid container spacing={2}>        // ❌ FORBIDDEN
<Grid2 container spacing={2}>       // ❌ FORBIDDEN
```

## Component Best Practices

### 1. Props Interface
```typescript
interface ComponentProps extends BaseComponentProps {
  // Required props first
  title: string;
  data: DataType[];
  
  // Optional props with defaults
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  onAction?: (data: DataType) => void;
}
```

### 2. State Management
```typescript
// Local state
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string>('');

// Form state pattern
const [formData, setFormData] = useState<FormType>({
  email: '',
  password: ''
});
```

### 3. Event Handlers
```typescript
// Async handlers
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    await apiCall();
    // Success handling
  } catch (error) {
    setError('Error message');
  } finally {
    setLoading(false);
  }
};

// Input handlers
const handleChange = (field: keyof FormType) => (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  setFormData(prev => ({
    ...prev,
    [field]: e.target.value
  }));
};
```

### 4. Responsive Design Patterns
```typescript
// Responsive layouts
<Box
  sx={{
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    gap: { xs: 2, md: 4 },
    p: { xs: 2, md: 4 }
  }}
>

// Responsive grid alternative (flexbox)
<Box
  sx={{
    display: 'flex',
    flexWrap: 'wrap',
    gap: 3,
    '& > *': {
      flex: {
        xs: '1 1 100%',
        sm: '1 1 calc(50% - 12px)',
        md: '1 1 calc(25% - 18px)'
      }
    }
  }}
>
```

## Form Validation Patterns

### 1. Basic Validation
```typescript
const validateForm = (data: FormType): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!data.email) errors.email = 'Email is required';
  if (!data.email.includes('@')) errors.email = 'Invalid email format';
  if (!data.password) errors.password = 'Password is required';
  if (data.password.length < 6) errors.password = 'Password must be 6+ characters';
  
  return errors;
};
```

### 2. Form Component Pattern
```typescript
export const FormComponent: React.FC<FormProps> = ({ onSubmit }) => {
  const [values, setValues] = useState<FormType>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(values);
    } catch (error) {
      setErrors({ submit: 'Submission failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        error={!!errors.email}
        helperText={errors.email}
        // ... other props
      />
      <Button type="submit" loading={loading}>
        Submit
      </Button>
    </Box>
  );
};
```

## Error Handling

### 1. Error Display
```typescript
// Alert for form errors
{error && (
  <Alert severity="error" sx={{ mb: 2 }}>
    {error}
  </Alert>
)}

// Field-specific errors
<TextField
  error={!!errors.fieldName}
  helperText={errors.fieldName}
/>
```

### 2. Loading States
```typescript
// Button loading
<Button loading={loading} disabled={loading}>
  {loading ? 'Processing...' : 'Submit'}
</Button>

// Skeleton loading
{loading ? (
  <Skeleton variant="rectangular" height={200} />
) : (
  <ActualContent />
)}
```

## Accessibility Rules

- Always provide `aria-label` for icon buttons
- Use semantic HTML elements
- Ensure proper heading hierarchy (h1 → h2 → h3)
- Include `alt` text for images
- Use proper form labels and associations 
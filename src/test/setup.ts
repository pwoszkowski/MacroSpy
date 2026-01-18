import "@testing-library/jest-dom";

// Mock dla matchMedia (wymagane przez niektóre komponenty UI)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock dla ResizeObserver (wymagane przez niektóre komponenty UI)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock dla IntersectionObserver (wymagane przez niektóre komponenty)
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock dla Supabase klienta
vi.mock("../db/supabase.client", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    })),
  },
}));

// Globalne ustawienia dla wszystkich testów
beforeAll(() => {
  // Ustawienia globalne przed wszystkimi testami
});

afterAll(() => {
  // Czyszczenie po wszystkich testach
});

beforeEach(() => {
  // Czyszczenie przed każdym testem
  vi.clearAllMocks();
});

afterEach(() => {
  // Czyszczenie po każdym teście
});

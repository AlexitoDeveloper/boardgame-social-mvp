# Reglas e Instrucciones del Proyecto

Este archivo contiene las directrices, reglas y estándares para el desarrollo del proyecto **boardgame-social-mvp**. Todos los desarrolladores y agentes de IA deben seguir estas directrices de manera estricta.

## 1. Tecnologías y Tipado (TypeScript)
- El proyecto debe utilizar **TypeScript** y tener todo **tipado**.
- Se deben evitar tipos laxos como `any`. Definir interfaces, tipos o genéricos según sea necesario.
- Si hay archivos JavaScript (`.js`, `.jsx`), deben ser migrados progresivamente a TypeScript (`.ts`, `.tsx`).

## 2. Arquitectura de Componentes y Modularización
- **No colocar toda la lógica en el mismo archivo del componente.**
- Dividir, modularizar y componetizar siempre que sea posible.
- Extraer la lógica compleja de negocio, peticiones a la API y manejo de estado a **Custom Hooks** dedicados.
- Mantener los componentes visuales tan puros y enfocados en la UI como sea posible.

## 3. Validación y Comprobaciones en Navegador
- **No hacer comprobaciones o validaciones mediante capturas de pantalla/navegación automatizada** en el navegador a menos que sea estrictamente necesario o el usuario lo solicite de manera explícita.
- Confiar en pruebas automatizadas y en el compilador de TypeScript para la validez de tipos y referencias de código.

## 4. Comunicación y Contexto
- **Preguntar siempre** que se necesite más contexto o si surge alguna duda sobre los requisitos, la arquitectura o las decisiones de diseño antes de proceder con el desarrollo.
- Priorizar la claridad de la implementación y alineación con las intenciones del usuario.

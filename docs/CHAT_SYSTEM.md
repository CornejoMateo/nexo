# Sistema de Chat — Documentación

## Índice

1. [Arquitectura general](#1-arquitectura-general)
2. [Base de datos](#2-base-de-datos)
3. [Tipos compartidos](#3-tipos-compartidos)
4. [Server Actions](#4-server-actions)
5. [Hooks de React](#5-hooks-de-react)
6. [Componentes UI](#6-componentes-ui)
7. [Suscripciones Realtime](#7-suscripciones-realtime)
8. [Caché](#8-caché)
9. [Autenticación y RLS](#9-autenticación-y-rls)
10. [Push Notifications](#10-push-notifications)
11. [Árbol de componentes](#11-árbol-de-componentes)
12. [Flujo de datos completo](#12-flujo-de-datos-completo)
13. [Guía de troubleshooting](#13-guía-de-troubleshooting)

---

## 1. Arquitectura general

El chat sigue una arquitectura **cliente-servidor con Realtime**:

- **Server Actions** (`'use server'`): Operaciones CRUD contra Supabase, siempre autenticadas con `getCurrentUser()`.
- **Hooks**: Manejan estado del lado del cliente, caché en memoria, y suscripciones Realtime.
- **Componentes**: UI pura, reciben todo por props desde `ChatManagement`.
- **Realtime**: `useChatRealtime` escucha `postgres_changes` en `messages` y actualiza el estado en vivo.

```
Usuario → Componente UI → Hook → Server Action → Supabase → Realtime → Hook → UI
```

---

## 2. Base de datos

### Tabla: `channels`

| Columna           | Tipo                      | Descripción              |
| ----------------- | ------------------------- | ------------------------ |
| `id`              | `BIGINT PK`               | ID autoincremental       |
| `created_at`      | `TIMESTAMPTZ`             | Fecha de creación        |
| `name`            | `VARCHAR`                 | Nombre del canal         |
| `description`     | `TEXT`                    | Descripción opcional     |
| `last_message_id` | `BIGINT FK → messages.id` | Último mensaje del canal |

### Tabla: `messages`

| Columna      | Tipo                           | Descripción             |
| ------------ | ------------------------------ | ----------------------- |
| `id`         | `BIGINT PK`                    | ID autoincremental      |
| `created_at` | `TIMESTAMPTZ`                  | Fecha del mensaje       |
| `content`    | `TEXT`                         | Contenido del mensaje   |
| `edited_at`  | `TIMESTAMPTZ NULL`             | Fecha de última edición |
| `deleted_at` | `TIMESTAMPTZ NULL`             | Soft-delete             |
| `user_id`    | `UUID FK → users.uid_user`     | Autor                   |
| `channel_id` | `BIGINT FK → channels.id`      | Canal al que pertenece  |
| `reply_to`   | `BIGINT NULL FK → messages.id` | Mensaje al que responde |

### Tabla: `channel_members`

| Columna                | Tipo                           | Descripción          |
| ---------------------- | ------------------------------ | -------------------- |
| `id`                   | `BIGINT PK`                    | ID autoincremental   |
| `joined_at`            | `TIMESTAMPTZ`                  | Fecha de ingreso     |
| `user_id`              | `UUID FK → users.uid_user`     | Miembro              |
| `channel_id`           | `BIGINT FK → channels.id`      | Canal                |
| `last_read_message_id` | `BIGINT NULL FK → messages.id` | Último mensaje leído |

### Stored Procedures

```sql
-- Devuelve contadores de no-leídos por canal para un usuario
get_unread_counts_by_channel(p_user_id UUID)

-- Devuelve el total de mensajes no-leídos para un usuario
get_unread_messages_count(p_user_id UUID)
```

---

## 3. Tipos compartidos

Definidos en `lib/chat/chat-types.ts`:

```
Channel { id, created_at?, name, description, last_message_id? }
ChannelMember { id, joined_at, user_id, channel_id, last_read_message_id? }
Message { id, created_at, content?, edited_at?, deleted_at?, user_id, channel_id, reply_to? }
UserProfile { uid_user, username?, name?, last_name?, role? }
MessageWithUser = Message & { users?: UserProfile }
ChannelWithMembers = Channel & { channel_members?: ChannelMember[] }
ChannelWithLastMessage = Channel & { last_message?, last_message_at?, member_count?, unread_count?, last_read_message_id? }
```

`ChannelWithLastMessage` es el tipo principal que maneja la UI: incluye `unread_count` y `last_read_message_id` calculados por el RPC `get_unread_counts_by_channel`.

---

## 4. Server Actions

Todas están en `lib/chat/` y usan el prefijo `'use server'`. Siguen el patrón `{ success, error?, data? }`.

### `channels.ts`

| Función                 | Input                          | Descripción                                                                                                           |
| ----------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `createChannelAction`   | `name, description`            | Crea canal + agrega al creador como miembro con `addChannelMember`                                                    |
| `updateChannelAction`   | `channelId, name, description` | Actualiza nombre/descripción                                                                                          |
| `deleteChannelAction`   | `channelId`                    | Elimina el canal (cascade)                                                                                            |
| `getUserChannelsAction` | —                              | Obtiene canales del usuario desde `channel_members` con join a `channels`, luego llama `get_unread_counts_by_channel` |
| `getChannelByIdAction`  | `channelId`                    | Obtiene un canal y verifica si el usuario es miembro                                                                  |

**Detalle de `getUserChannelsAction`:**

1. Query a `channel_members` con join a `channels`
2. Incluye `last_read_message_id` de `channel_members`
3. Llama RPC `get_unread_counts_by_channel(p_user_id)` para obtener contadores
4. Mapea resultados combinando channel data + unread_count + last_read_message_id

### `messages.ts`

| Función                      | Input                            | Descripción                                                                                        |
| ---------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------- |
| `getMessagesAction`          | `channelId`                      | Últimos 50 mensajes con join a `users`, orden descendente por `created_at`, revierte a cronológico |
| `sendMessageAction`          | `channelId, content, replyToId?` | Inserta mensaje, hace select con join a `users` para devolver `MessageWithUser` completo           |
| `editMessageAction`          | `messageId, content`             | Actualiza `content` y setea `edited_at` al momento actual                                          |
| `deleteMessageAction`        | `messageId`                      | Soft-delete: setea `deleted_at`                                                                    |
| `cleanChannelMessagesAction` | `channelId, cleanupDate`         | Hard-delete: primero SELECT de IDs viejos, luego DELETE uno por uno                                |

**Nota sobre `sendMessageAction`:** No actualiza `channels.last_message_id`. Eso se maneja del lado de Supabase con un trigger o se actualiza por separado. La UI depende del Realtime para mostrar el nuevo mensaje.

### `channel-members.ts`

| Función                         | Input                          | Descripción                                                               |
| ------------------------------- | ------------------------------ | ------------------------------------------------------------------------- |
| `addChannelMember`              | `channelId, userId`            | Inserta en `channel_members` (con Server client, usado al crear canal)    |
| `addMemberToChannelAction`      | `channelId, userId`            | Inserta usando **service_role key** (bypass RLS)                          |
| `removeMemberFromChannelAction` | `channelId, userId`            | DELETE de `channel_members`                                               |
| `getChannelMembersAction`       | `channelId`                    | SELECT con join a `users`, usando **service_role key**                    |
| `getAvailableUsersAction`       | —                              | Fetch a `/api/users` con JWT del usuario logueado                         |
| `updateLastReadMessage`         | `messageId, channelId, userId` | UPDATE condicional de `last_read_message_id` (solo si es mayor al actual) |

**¿Por qué `addMemberToChannelAction` usa service_role?** Porque la policy de INSERT en `channel_members` requiere Admin, pero el Admin que ejecuta la acción no es necesariamente el user_id del INSERT. La autorización ya se validó en el frontend (solo Admin puede abrir el dialog). El service_role bypassa RLS completamente.

---

## 5. Hooks de React

### `useChatRealtime` (`hooks/chat/use-chat-realtime.ts`)

Hook principal para mensajes en vivo.

**Estado:**

- `messages: MessageWithUser[]` — mensajes del canal actual
- `loading: boolean` — indica si está cargando
- `error: string | null` — error si falló la carga
- `refresh()` — fuerza refetch y limpia caché

**Comportamiento:**

1. Al montarse o cambiar `channelId`, llama `fetchMessages()`
2. `fetchMessages` chequéa caché (TTL 30s) — si hay datos frescos, los usa sin hacer fetch
3. Se suscribe a `postgres_changes` en `public.messages` filtrado por `channel_id`
4. **INSERT**: Refetchea el registro completo con join a `users` y lo agrega al estado (evita duplicados)
5. **UPDATE**: Mergea campos nuevos al mensaje existente, preservando `users`
6. **DELETE**: Remueve el mensaje del estado por `oldRecord.id`
7. Escucha evento `new-message` en `window` (CustomEvent dispatchado por `useChatManagement` al enviar)

**Caché:** Mapa global `Map<number, CacheEntry>` con TTL 30s. La clave es `channelId`.

### `useChatManagement` (`hooks/chat/use-chat-management.ts`)

Orquestador principal del chat. Maneja toda la lógica de negocio del lado del cliente.

**Estado principal:**

| Variable                 | Tipo                           | Descripción                              |
| ------------------------ | ------------------------------ | ---------------------------------------- |
| `channels`               | `ChannelWithLastMessage[]`     | Canales del usuario                      |
| `selectedChannel`        | `ChannelWithLastMessage\|null` | Canal activo                             |
| `newMessage`             | `string`                       | Texto del input                          |
| `loading`                | `boolean`                      | Carga inicial de canales                 |
| `initialLoadDone`        | `boolean`                      | Primera carga completada                 |
| `showCreateDialog`       | `boolean`                      | Diálogo crear canal                      |
| `showMembersDialog`      | `boolean`                      | Diálogo miembros                         |
| `members`                | `any[]`                        | Miembros del canal activo                |
| `searchTerm`             | `string`                       | Búsqueda de mensajes                     |
| `showSearch`             | `boolean`                      | Barra de búsqueda visible                |
| `editingMessage`         | `{id, content}\|null`          | Mensaje en edición                       |
| `replyingTo`             | `MessageWithUser\|null`        | Mensaje al que se responde               |
| `sending`                | `boolean`                      | Enviando mensaje                         |
| `showCleanupDialog`      | `boolean`                      | Diálogo limpiar mensajes                 |
| `cleanupDate`            | `string`                       | Fecha para limpiar                       |
| `pendingDeleteMessage`   | `number\|null`                 | Confirmación pendiente: eliminar mensaje |
| `pendingDeleteChannel`   | `{id, name}\|null`             | Confirmación pendiente: eliminar canal   |
| `pendingCleanupMessages` | `boolean`                      | Confirmación pendiente: limpiar          |
| `totalUnreadCount`       | `number`                       | Suma de no-leídos (computed)             |

**Handlers principales y su flujo:**

**`handleSendMessage(channelId)`:**

1. Valida que haya contenido, usuario, y que no esté enviando
2. Setea `sending = true`, limpia `newMessage`
3. Llama `sendMessageAction` con contenido y `replyTo.id` opcional
4. Si falla, restaura el mensaje en el input y muestra toast de error
5. Si éxito, limpia `replyingTo` y dispatcha evento `new-message` (para que `useChatRealtime` lo agregue)
6. Hace scroll al fondo del ScrollArea (50ms timeout)

**`handleChannelSelect(channel)`:**

1. Setea `selectedChannel`
2. Si el canal tiene `last_message_id`, actualiza `last_read_message_id` en DB
3. Resetea `searchTerm`, cierra sidebar (mobile), resetea `scrolledToUnread` y `replyingTo`

**`handleDeleteMessage(messageId)`:**

1. Setea `pendingDeleteMessage` (abre AlertDialog de confirmación)

**`confirmDeleteMessage()`:**

1. Lee `pendingDeleteMessage`, lo resetea a `null`
2. Llama `deleteMessageAction` (soft-delete)
3. Toast de éxito/error

**`handleDeleteChannel(channelId, channelName)`:**

1. Setea `pendingDeleteChannel` (abre AlertDialog)

**`confirmDeleteChannel()`:**

1. Lee `pendingDeleteChannel`, lo resetea
2. Llama `deleteChannelAction`
3. Si éxito: deselecciona el canal si era el actual, invalida caché de canales, reload, toast

**`handleCleanupMessages()`:**

1. Valida `selectedChannel`, usuario y `cleanupDate`
2. Setea `pendingCleanupMessages` (abre AlertDialog)

**`confirmCleanupMessages()`:**

1. Resetea `pendingCleanupMessages`
2. Llama `cleanChannelMessagesAction` (hard-delete)
3. Si éxito: cierra diálogo, resetea fecha, toast

**Caché de canales:** Variable global `channelsCache` con TTL 30s. `loadChannels()` usa stale-while-revalidate: si hay caché, muestra datos inmediatamente y hace background fetch si está stale. Se invalida (`channelsCache = null`) al crear o eliminar un canal.

**Auto-scroll:** Cuando cambia `selectedChannel` o llegan `messages`, espera `SCROLL_DELAY` (100ms) y hace scroll al fondo. Usa `scrollChannelIdRef` para evitar race conditions.

### `useChatUnreadCount` (`hooks/chat/use-chat-unread-count.ts`)

Suscripción global al contador total de no-leídos. No es parte del flujo principal de chat sino un badge en el header general de la app.

---

## 6. Componentes UI

### `ChatManagement` — Orquestador

Es el punto de entrada. Renderiza `ChatSidebar` + `Card` (con `ChatHeader`, `MessagesList`, `MessageInput`) + diálogos modales.

Obtiene `user` de `useAuth()`, llama `useChatRealtime` y `useChatManagement`, y conecta todo:

- Pasa `chatManagement.selectedChannel?.id` a `useChatRealtime` para que cargue los mensajes
- Filtra mensajes por `searchTerm` (por contenido, username, name, last_name)
- Renderiza los 3 AlertDialog de confirmación: eliminar mensaje, eliminar canal, limpiar mensajes

### `ChatSidebar`

- Lista de canales del usuario
- Botón "Nuevo" (solo Admin)
- Botón de eliminar canal por fila (solo Admin, icono trash rojo)
- Badge de no-leídos (máximo "99+")
- Overlay en mobile al abrir sidebar
- PushNotificationSettings opcional

### `ChatHeader`

- Nombre y descripción del canal
- Botón de búsqueda (toggle)
- Botón "Limpiar" (solo Admin)
- Botón "Miembros"
- Botón "Atrás" en mobile
- Input de búsqueda cuando está activo

### `MessagesList`

- `ScrollArea` con ref para auto-scroll
- Estados: Cargando, sin mensajes, sin resultados de búsqueda
- Renderiza `MessageItem` por cada mensaje

### `MessageItem`

- **Alineación**: mensajes propios a la derecha (`bg-primary`), ajenos a la izquierda (`bg-muted`)
- **Autor**: solo se muestra para mensajes ajenos (name + last_name, fallback a username, fallback a "Usuario")
- **Respuesta**: si `reply_to` no es null, muestra `QuoteMessage` arriba del contenido
- **Eliminado**: muestra "Este mensaje fue eliminado" en itálica
- **Edición**: inline con Input + botones Guardar (primario) y Cancelar (blanco, texto ámbar, sin hover)
- **Timestamp**: `formatCreatedAtChat` — solo hora si es hoy, fecha + hora si es anterior
- **Acciones** (solo mensajes no-eliminados):
  - Responder (todos, icono `MessageCircle`)
  - Editar (propios, icono `Edit2`)
  - Eliminar (propios, icono `Trash2`)

### `MessageInput`

- Input de texto + botón Send
- Si `replyingTo` no es null, muestra `QuoteMessage` con botón de cancelar arriba del input
- Enter para enviar, deshabilitado si está vacío o enviando

### `QuoteMessage`

- Muestra autor (name + last_name) y contenido truncado (50 chars)
- Borde izquierdo `border-primary`
- Si `showCancel` true y `onCancel` presente, muestra botón X

### `CreateChannelDialog`

- Modal con campo nombre (requerido) y descripción (opcional)
- Submit: llama `createChannelAction`, si éxito resetea campos y llama `onChannelCreated`

### `ChannelMembersDialog`

- **Dos secciones:**
  1. "Agregar miembro": select con usuarios disponibles (excluye miembros actuales) + botón +
  2. "Miembros actuales": lista con scroll, botón de remover (solo Admin)
- **Remove**: AlertDialog de confirmación antes de remover
- Los usuarios disponibles se cargan desde `getAvailableUsersAction` (fetch a `/api/users`)
- El filtro `availableToAdd` compara `uid_user` vs `uid_user`

### `CleanupMessagesDialog`

- Input tipo date + botón Confirmar
- `onCleanup` dispara el handler del hook que abre el AlertDialog de confirmación

### AlertDialogs de confirmación

- **Eliminar mensaje**: simple confirmación
- **Eliminar canal**: muestra el nombre del canal en la descripción
- **Limpiar mensajes**: descripción genérica

Todos tienen botón Cancelar + Eliminar.

---

## 7. Suscripciones Realtime

### `useChatRealtime`

Se suscribe a:

```typescript
supabase
  .channel(`messages-${channelId}`)
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
    async (payload) => { ... }
  )
  .subscribe()
```

**Eventos:**

- **INSERT**: Busca el mensaje completo con join a `users`, evita duplicados por ID
- **UPDATE**: Mergea campos nuevos al mensaje existente, preserva `users`
- **DELETE**: Filtra por `oldRecord.id`

**Custom event `new-message`:** El hook también escucha eventos dispatchados por `useChatManagement.handleSendMessage`. Esto acelera la aparición del mensaje enviado por el usuario (no espera el Realtime).

### `useChatUnreadCount`

**Dos suscripciones:**

1. `postgres_changes` en `public.messages` (event: '*') — cualquier cambio en mensajes
2. `postgres_changes` en `public.channel_members` (event: 'UPDATE') — cambio de lectura

Ambas disparan `get_unread_messages_count` RPC.

---

## 8. Caché

| Cache                | Locación                                                 | TTL | Comportamiento                                                                   |
| -------------------- | -------------------------------------------------------- | --- | -------------------------------------------------------------------------------- |
| Mensajes             | `useChatRealtime.ts` — `Map<number, CacheEntry>`         | 30s | Stale-while-revalidate: si hay datos frescos, no fetchea                         |
| Canales              | `useChatManagement.ts` — `channelsCache` variable global | 30s | Stale-while-revalidate: muestra datos inmediatos, refresh en background si stale |
| Contadores no-leídos | Server-side RPC                                          | —   | Sin caché, se llama cada vez que hay un cambio Realtime                          |

**Invalidación de caché de canales:** Se setea `channelsCache = null` cuando:

- Se crea un canal (`handleChannelCreated`)
- Se elimina un canal (`confirmDeleteChannel`)

**Invalidación de caché de mensajes:** `refresh()` elimina la entrada del Map y fuerza fetch.

---

## 9. Autenticación y RLS

### Server Actions

Todas las server actions llaman `getCurrentUser()` para verificar que el usuario está autenticado:

```typescript
const supabase = await getServerSupabaseClient();
const user = await getCurrentUser();
```

`getServerSupabaseClient()` usa `createServerClient` de `@supabase/ssr` con cookies SSR.

### Service Role Key

`addMemberToChannelAction` y `getChannelMembersAction` usan `SUPABASE_SERVICE_ROLE_KEY` para bypass RLS. Esto es intencional: la autorización se valida en código (solo Admin puede agregar miembros), y RLS no permite fácilmente el INSERT de un Admin en nombre de otro usuario.

### Políticas RLS

| Tabla             | Operación | Quién puede                              |
| ----------------- | --------- | ---------------------------------------- |
| `channels`        | SELECT    | Miembros del canal o Admin               |
| `channels`        | INSERT    | Admin                                    |
| `channels`        | DELETE    | Admin                                    |
| `channel_members` | SELECT    | Propio registro o Admin                  |
| `channel_members` | INSERT    | Admin                                    |
| `channel_members` | UPDATE    | Propio registro (`last_read_message_id`) |
| `channel_members` | DELETE    | Admin                                    |
| `messages`        | SELECT    | Miembros del canal o Admin               |
| `messages`        | INSERT    | Miembros del canal                       |
| `messages`        | UPDATE    | Autor del mensaje o Admin                |
| `messages`        | DELETE    | Autor del mensaje o Admin                |
| `users`           | SELECT    | Propio registro o Admin                  |
| `message_reads`   | SELECT    | Propio registro                          |
| `message_reads`   | INSERT    | Miembros del canal                       |

**Problema conocido con RLS:** La policy de INSERT en `channel_members` usa un subquery `EXISTS (SELECT 1 FROM public.users WHERE ...)` que requiere SELECT en `users`. La policy de `users` solo permite leer el propio registro. Por eso las operaciones Admin usan service_role.

---

## 10. Push Notifications

### Componentes involucrados

| Archivo                                                   | Rol                                                                        |
| --------------------------------------------------------- | -------------------------------------------------------------------------- |
| `lib/push/vapid.ts`                                       | Configura `web-push` con claves VAPID                                      |
| `lib/push/subscriptions.ts`                               | CRUD de `push_subscriptions` en DB, `getChannelPushSubscriptions()`        |
| `hooks/push/use-push-notifications.ts`                    | Hook del navegador: registra SW, pide permiso, subscribe/unsubscribe       |
| `actions/push/send-notification.ts`                       | Server action: envía push a todos los miembros del canal excepto el sender |
| `components/business/chat/push-notification-settings.tsx` | UI: botón para activar/desactivar notificaciones                           |

### Flujo de subscription

1. `usePushNotifications` verifica soporte del navegador (`'serviceWorker' in navigator`)
2. Registra Service Worker en `/sw.js`
3. Pide permiso `Notification.requestPermission()`
4. Convierte `vapidPublicKey` a `Uint8Array`
5. Llama `PushManager.subscribe()` con `userVisibleOnly: true` y `applicationServerKey`
6. Guarda la subscription en `push_subscriptions` vía fetch a endpoint

### Flujo de envío

`sendPushNotificationToChannel()` (definida pero **no llamada actualmente** en el código del chat):

1. Busca todos los miembros del canal excepto el sender
2. Para cada miembro, busca sus push subscriptions
3. Envía notificación con `web-push` con payload:
   ```json
   { "title": "Nuevo mensaje en {channelName}", "body": "{senderName}: {message[:100]}", "data": { "channelId", "channelName", "senderUserId" } }
   ```

---

## 11. Árbol de componentes

```
ChatPage (app/chat/page.tsx)
  └─ DashboardLayout
      └─ ChatManagement (business/chat/chat-management.tsx)
           ├─ useAuth() ──────────── user session
           ├─ useChatRealtime() ──── mensajes + Realtime
           ├─ usePushNotifications()
           ├─ useChatManagement() ─── estado y lógica
           │
           ├─ ChatSidebar
           │    ├─ Lista de canales
           │    ├─ Unread badges
           │    ├─ Crear (Admin)
           │    ├─ Eliminar (Admin)
           │    └─ PushNotificationSettings
           │
           ├─ Card
           │    ├─ ChatHeader
           │    │    ├─ Nombre/descripción
           │    │    ├─ Buscar
           │    │    ├─ Limpiar (Admin)
           │    │    └─ Miembros
           │    │
           │    ├─ MessagesList
           │    │    └─ MessageItem (×N)
           │    │         ├─ QuoteMessage (si reply_to)
           │    │         ├─ Contenido / Edición / Eliminado
           │    │         └─ Timestamp + Acciones
           │    │
           │    └─ MessageInput
           │         └─ QuoteMessage (si replying)
           │
           ├─ CreateChannelDialog
           ├─ ChannelMembersDialog
           │    └─ AlertDialog (remover miembro)
           ├─ CleanupMessagesDialog
           ├─ AlertDialog (eliminar mensaje)
           ├─ AlertDialog (eliminar canal)
           └─ AlertDialog (limpiar mensajes)
```

---

## 12. Flujo de datos completo

```
1. USUARIO SELECCIONA CANAL
   handleChannelSelect(channel) ──────────────────────────────────────► useChatManagement
     ├─ setSelectedChannel(channel)                                      actualiza estado
     ├─ updateLastReadMessage() ──────────────────────────► Server Action ──► UPDATE channel_members
     ├─ reset search, sidebar, replying
     └─ useEffect [selectedChannel] dispara:
          ├─ updateLastReadMessage() (vuelve a llamar)
          └─ setChannels(prev => prev.map ch.unread_count = 0)

   useChatRealtime(channelId) ───► fetchMessages() ──────────► getMessagesAction() ──► SELECT messages
     ├─ caché: si hay datos frescos (TTL 30s) → usa eso, no fetchea
     └─ subscribe postgres_changes messages ─────► Realtime escucha INSERT/UPDATE/DELETE

   scrollChannelIdRef + useEffect ───► setTimeout(100ms) ───► scrollArea.scrollTop = scrollHeight

2. USUARIO ENVÍA MENSAJE
   handleSendMessage(channelId)
     ├─ setSending(true), setNewMessage('')
     ├─ sendMessageAction(channelId, content, replyToId) ───────► INSERT messages
     │     └─ return MessageWithUser completo (con users)
      ├─ dispatchEvent('new-message', result.data) ───► useChatRealtime (setMessages)
     ├─ setTimeout(50ms) ───► scroll al fondo
     └─ setSending(false)

   OTROS USUARIOS RECIBEN:
     Realtime INSERT ───► fetch full message + users ───► messages state

3. USUARIO EDITA MENSAJE
   onSetEditingMessage({id, content}) ───► inline Input
   Guardar ──► handleEditMessage(id, content) ───► editMessageAction() ───► UPDATE messages SET edited_at
   Cancelar ──► onSetEditingMessage(null)

   OTROS RECIBEN:
     Realtime UPDATE ───► mergea { ...msg, ...newRecord, users: msg.users }

4. USUARIO ELIMINA MENSAJE
   handleDeleteMessage(id) ───► setPendingDeleteMessage(id) ───► AlertDialog
   Confirmar ──► confirmDeleteMessage() ───► deleteMessageAction() ───► UPDATE messages SET deleted_at
   Cancelar ──► cancelDeleteMessage()

   OTROS RECIBEN:
     Realtime UPDATE (soft-delete cambia deleted_at) ───► muestra "Este mensaje fue eliminado"

5. ADMIN CREA CANAL
   CreateChannelDialog ──► createChannelAction(name, description)
     ├─ INSERT channels
     └─ addChannelMember(channelId, userId) ──► INSERT channel_members
   onChannelCreated ──► channelsCache = null ──► loadChannels() refetch

6. ADMIN ELIMINA CANAL
   handleDeleteChannel(id, name) ──► setPendingDeleteChannel ──► AlertDialog
   Confirmar ──► confirmDeleteChannel() ──► deleteChannelAction() ──► DELETE channels (cascade)
     ├─ deselect si era el actual
     ├─ channelsCache = null
     └─ loadChannels()

7. ADMIN AGREGA MIEMBRO
   ChannelMembersDialog ──► addMemberToChannelAction(channelId, userId)
     └─ INSERT channel_members (service_role)
   onMembersUpdated ──► loadMembers(channelId) refetch

8. ADMIN REMUEVE MIEMBRO
   AlertDialog confirm ──► removeMemberFromChannelAction(channelId, userId)
     └─ DELETE channel_members
   onMembersUpdated ──► loadMembers(channelId) refetch

9. ADMIN LIMPIA MENSAJES
   CleanupMessagesDialog ──► handleCleanupMessages() ──► setPendingCleanupMessages ──► AlertDialog
   Confirmar ──► confirmCleanupMessages() ──► cleanChannelMessagesAction()
     ├─ SELECT messages.id WHERE channel_id AND created_at < cleanupDate
     └─ DELETE messages WHERE id IN (...) (uno por uno, hard delete)
```

---

## 13. Guía de troubleshooting

### Problemas comunes

**"El mensaje se envía pero no aparece para otros usuarios"**

- Verificar que `sendMessageAction` devuelve `data` con el mensaje completo
- Verificar que `dispatchEvent('new-message', ...)` se ejecuta
- Verificar que la suscripción Realtime está activa (consola → pestaña Network → WebSockets)
- Verificar que el Realtime INSERT fetchea correctamente el mensaje con users

**"No se ven los canales cargados"**

- Verificar que `getUserChannelsAction` no devuelve error
- Verificar la caché: `channelsCache` puede estar stale pero no expirado
- Verificar que el usuario tiene registros en `channel_members`

**"El scroll no funciona al cambiar de canal"**

- Verificar que `messagesScrollRef` apunta al componente `ScrollArea` correcto
- Verificar que el selector `[data-slot="scroll-area-viewport"]` coincide con la versión de Radix
- Verificar que `scrollChannelIdRef.current !== selectedChannel.id` no cancela el scroll

**"Los AlertDialog no aparecen"**

- Verificar que el estado `pendingDeleteMessage`/`pendingDeleteChannel`/`pendingCleanupMessages` se está seteando
- Verificar que los AlertDialog están renderizados en `ChatManagement`

**"Error RLS al agregar miembro"**

- `addMemberToChannelAction` usa service_role, no debería fallar por RLS
- Si falla, verificar `SUPABASE_SERVICE_ROLE_KEY` en environment variables

**"No se cargan los usuarios disponibles en el diálogo de miembros"**

- `getAvailableUsersAction` hace fetch a `/api/users`
- Verificar que el endpoint requiere token JWT válido
- Verificar la policy `"Admins read all users"` en la tabla `users`

### Debugging

Todas las server actions tienen `console.log`/`console.error` con el prefijo `[functionName]`. Revisar la consola del servidor (terminal donde corre Next.js).

Para debuggear Realtime, abrir Chrome DevTools → Network → WS y buscar el canal `messages-{channelId}`. Verificar que los eventos `INSERT`/`UPDATE`/`DELETE` llegan.

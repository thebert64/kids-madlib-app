# Troubleshooting Guide

## Issues & Solutions

### 1. **"Cannot find module '@prisma/client'" Error**

**Solution:**
```bash
npx prisma generate
```

This generates the Prisma client from your schema.

---

### 2. **"PrismaClientInitializationError" or Database Connection Issues**

**Solution:**
Make sure the database is initialized:

```bash
# Option 1: Using migrations
npx prisma migrate deploy

# Option 2: Using db push (for development)
npx prisma db push
```

If you don't have any migrations yet:
```bash
npx prisma migrate dev --name init
```

---

### 3. **"Unexpected token '<', '<!DOCTYPE'... is not valid JSON"**

This means the API is returning an HTML error page instead of JSON.

**Solution:**
1. Check the browser console for the actual error
2. Make sure the database is initialized (see issue #2)
3. Verify all API routes are working:
   ```bash
   curl http://localhost:3000/api/stories
   ```

---

### 4. **React Hydration Errors**

**Solution:**
1. Clear browser cache and rebuild
   ```bash
   npm run build
   npm run dev
   ```
2. If using dev container, restart the container

---

### 5. **"Failed to create story" or Form Submission Issues**

**Checklist:**
- ✅ Did you enter both your name and story title?
- ✅ Is the database initialized?
- ✅ Are there any errors in the browser console?
- ✅ Is the development server running?

Check browser console (F12) for detailed error messages.

---

## Full Restart

If everything seems broken:

```bash
# 1. Stop the dev server (Ctrl+C)

# 2. Clean up
rm -rf .next node_modules

# 3. Reinstall
npm install

# 4. Generate Prisma client
npx prisma generate

# 5. Initialize database
npx prisma db push

# 6. Start fresh
npm run dev
```

---

## Getting Help

If you still have issues:

1. **Check the browser console** (F12 → Console tab) for JavaScript errors
2. **Check the terminal** where you ran `npm run dev` for server errors
3. **Check the Network tab** (F12 → Network) to see what the API is returning
4. Look for error messages in `/prisma/app.db` directory

---

## Development Tips

- Use `npx prisma studio` to view/edit database data graphically
- Use `npm run build` to check for TypeScript errors without running the server
- Add `console.log()` statements in API routes to debug issues

# How to Add Images to Events

## Method 1: Add Image When Creating an Event

1. **Go to Manager Dashboard** → Click "Create New Event"
2. **Fill in event details** (Name, Description, Category, Date, Time, Location)
3. **Upload Event Image** - Click on the image upload area to select a banner image
4. **Add Gallery Photos (Optional)** - Add up to 10 additional photos with captions
5. **Add Ticket Types** - Define ticket categories and prices
6. **Click "Create Event"** - Event is created with the main image
7. **Gallery photos are automatically uploaded** after event creation

### File Requirements:
- **Format**: JPG, PNG, WebP, etc.
- **Size**: Recommended 600x400px or larger for banner
- **Max file size**: No limit (use reasonable sizes)

---

## Method 2: Update Event Image (Edit Event)

### For Admin Users:
1. **Go to Admin Dashboard** → Events
2. **Find the event** (e.g., "Halloween Event")
3. **Click Edit** on the event card
4. **Update Image**:
   - Click on the dashed border area to upload a new image
   - Preview appears instantly
   - Click the ❌ button to remove and select a different image
5. **Make other changes** if needed (Title, Description, Date, etc.)
6. **Click "Save Changes"** to update

### For Manager Users:
1. **Go to Manager Dashboard** → My Events
2. **Click the event** you want to edit
3. **Look for Edit option** in the event details
4. **Follow the same steps** as Admin

---

## API Endpoints

### Create Event with Image (POST)
```
POST http://localhost:5000/api/events
Headers:
  Authorization: Bearer <token>
  Content-Type: multipart/form-data

Body (FormData):
  name: "Halloween Event"
  description: "Spooky costume party"
  category: "Party"
  date: "2024-10-31"
  time: "18:00"
  location: "Party Hall"
  image: <file>
  ticketTypes: '[{"name":"General","quantity":100,"price":500}]'
```

### Update Event with Image (PUT)
```
PUT http://localhost:5000/api/events/<eventId>
Headers:
  Authorization: Bearer <token>
  Content-Type: multipart/form-data

Body (FormData):
  title: "Halloween Event"
  description: "Spooky costume party"
  date: "2024-10-31"
  time: "18:00"
  location: "Party Hall"
  image: <file>  (optional - only if changing image)
```

---

## Image Upload Flow

### Backend Flow:
1. **Multer middleware** captures the image file
2. **File stored** in `/uploads/events/` directory
3. **imageUrl** saved as `/uploads/events/filename.jpg`
4. **Static route** serves images via `http://localhost:5000/uploads/events/`

### Frontend Flow:
1. **Select image** → Preview displays instantly
2. **FormData created** with image file + other fields
3. **POST/PUT request** sent to backend
4. **Success message** shown on completion
5. **Page redirects** or updates with new image

---

## Halloween Event Example

To add an image to your Halloween event:

1. **If creating new**:
   - Dashboard → Create New Event
   - Fill: "Halloween Party", "Spooky celebration", "Party" category
   - Upload a halloween-themed image (costume, pumpkins, ghosts, etc.)
   - Set date to October 31, 2024
   - Add ticket types
   - Click Create

2. **If updating existing**:
   - Go to Admin Dashboard → Events
   - Find "Halloween Event"
   - Click Edit
   - Click image area
   - Choose halloween image from your computer
   - Click Save Changes

---

## Image Display

### Where Images Appear:

1. **Event Cards** (Dashboard & Browse):
   - Hero section with gradient overlay
   - Event title on top of image
   - Hover effects for interactivity

2. **Event Detail Pages**:
   - Full-width hero section (h-96)
   - Dark gradient overlay for readability
   - Image as background with text overlay

3. **Gallery Section**:
   - Additional photos with captions
   - Responsive grid layout
   - Hover zoom effects

---

## Tips

✅ Use high-quality images (JPG recommended)
✅ Choose images with good color contrast
✅ For hero images, use landscape orientation (16:9 ratio)
✅ Gallery photos can be any orientation
✅ Add meaningful captions to gallery photos
✅ Test image loading on slow connections

---

## Troubleshooting

### Image Not Uploading:
- Check file format (JPG, PNG, WebP)
- Ensure file is not corrupt
- Check file size isn't too large
- Verify you're logged in with correct role

### Image Shows as Placeholder:
- Image URL may be incorrect
- Check `/uploads/events/` folder exists
- Verify backend static route is configured
- Check browser console for fetch errors

### Image Quality is Poor:
- Compress image before uploading
- Use higher resolution source image
- Check CSS object-fit property

---

## Backend Configuration

The image upload is configured in:
- `backend/middleware/uploadMiddleware.js` - Multer storage config
- `backend/routes/eventRoutes.js` - Route with upload middleware
- `backend/server.js` - Static route for `/uploads/events/`
- `backend/controllers/eventController.js` - Image handling logic

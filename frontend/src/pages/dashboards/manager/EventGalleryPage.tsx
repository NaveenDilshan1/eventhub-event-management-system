import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, Trash2, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GalleryImage {
  id: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
  uploadedBy?: { firstName: string; lastName: string };
}

export default function EventGalleryPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, [eventId]);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/gallery/${eventId}`);
      if (!res.ok) throw new Error("Failed to fetch gallery");
      const data = await res.json();
      setGallery(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error("Please select an image");
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("caption", caption);

      const res = await fetch(`http://localhost:5000/api/gallery/${eventId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload image");

      toast.success("Image uploaded to gallery!");
      setImageFile(null);
      setImagePreview("");
      setCaption("");
      await fetchGallery();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm("Delete this image?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/gallery/${eventId}/${imageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete image");

      toast.success("Image deleted");
      await fetchGallery();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete image");
    }
  };

  if (loading) return <DashboardLayout><div className="text-center py-12">Loading gallery...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Event Gallery</h1>
            <p className="text-muted-foreground mt-1">Manage event photos and images</p>
          </div>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gallery-image">Select Image</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <input
                    id="gallery-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {imagePreview ? (
                    <div className="space-y-2">
                      <img src={imagePreview} alt="Preview" className="mx-auto max-h-64 rounded" />
                      <p className="text-sm text-muted-foreground">Click to change image</p>
                    </div>
                  ) : (
                    <div onClick={() => document.getElementById("gallery-image")?.click()} className="cursor-pointer">
                      <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click to select image</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="caption">Image Caption (Optional)</Label>
                <Textarea
                  id="caption"
                  placeholder="Add a caption for this image..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={2}
                />
              </div>

              <Button type="submit" disabled={!imageFile || uploading} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Uploading..." : "Upload to Gallery"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Gallery Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Gallery ({gallery.length} images)</h2>
          {gallery.length === 0 ? (
            <Card className="text-center py-12">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No images in gallery yet. Upload your first image above!</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gallery.map((image) => (
                <Card key={image.id} className="overflow-hidden">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img src={image.imageUrl} alt={image.caption} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </div>
                  <CardContent className="pt-4 space-y-2">
                    {image.caption && <p className="text-sm font-medium">{image.caption}</p>}
                    <p className="text-xs text-muted-foreground">
                      {image.uploadedBy ? `Uploaded by ${image.uploadedBy.firstName}` : "Uploaded"}
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => handleDelete(image.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

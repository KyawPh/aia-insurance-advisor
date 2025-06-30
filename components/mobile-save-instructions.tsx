import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Smartphone, Download } from "lucide-react"

interface MobileSaveInstructionsProps {
  open: boolean
  onClose: () => void
  platform: 'ios' | 'android' | 'unknown'
}

export function MobileSaveInstructions({ open, onClose, platform }: MobileSaveInstructionsProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            How to Save Your Report
          </DialogTitle>
          <DialogDescription>
            Follow these steps to save the report image to your device
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          {platform === 'ios' ? (
            <ol className="space-y-3 text-sm">
              <li className="flex gap-2">
                <span className="font-semibold text-red-600">1.</span>
                <span>Press and hold on the report image above</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-red-600">2.</span>
                <span>A menu will appear</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-red-600">3.</span>
                <span>Tap "Save Image" to save to your Photos</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-red-600">4.</span>
                <span>The image will be saved to your Photos app</span>
              </li>
            </ol>
          ) : (
            <ol className="space-y-3 text-sm">
              <li className="flex gap-2">
                <span className="font-semibold text-red-600">1.</span>
                <span>Press and hold on the report image above</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-red-600">2.</span>
                <span>A menu will appear</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-red-600">3.</span>
                <span>Tap "Download image" or "Save image"</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-red-600">4.</span>
                <span>The image will be saved to your Downloads or Gallery</span>
              </li>
            </ol>
          )}
          
          <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
            <p className="font-medium mb-1">Alternative method:</p>
            <p>Take a screenshot of the report for quick saving</p>
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <Button onClick={onClose} className="bg-red-600 hover:bg-red-700 text-white">
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
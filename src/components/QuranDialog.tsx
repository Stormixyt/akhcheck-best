import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface QuranDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: "gooned" | "disciplined" | null;
}

const quranVerses = {
  disciplined: [
    {
      text: "And it is He who created the heavens and earth in truth. And the day He says, 'Be,' and it is, His word is the truth.",
      reference: "Quran 6:73",
      theme: "discipline"
    },
    {
      text: "And give good tidings to the patient, Who, when disaster strikes them, say, 'Indeed we belong to Allah, and indeed to Him we will return.'",
      reference: "Quran 2:155-156",
      theme: "patience"
    },
    {
      text: "And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose.",
      reference: "Quran 65:3",
      theme: "trust"
    },
    {
      text: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
      reference: "Quran 2:152",
      theme: "gratitude"
    }
  ],
  gooned: [
    {
      text: "And it is He who accepts repentance from his servants and forgives sins, and He knows what you do.",
      reference: "Quran 42:25",
      theme: "repentance"
    },
    {
      text: "Say, 'O My servants who have transgressed against themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins. Indeed, it is He who is the Forgiving, the Merciful.'",
      reference: "Quran 39:53",
      theme: "hope"
    },
    {
      text: "And whoever does a wrong action and then repents and believes, then indeed, your Lord is Forgiving and Merciful.",
      reference: "Quran 25:71",
      theme: "forgiveness"
    }
  ]
};

export const QuranDialog = ({ open, onOpenChange, status }: QuranDialogProps) => {
  if (!status) return null;

  const verses = quranVerses[status];
  const randomVerse = verses[Math.floor(Math.random() * verses.length)];

  const getTitle = () => {
    return status === "disciplined" 
      ? "Alhamdulillah! 🤲" 
      : "Don't lose hope, brother 💚";
  };

  const getMessage = () => {
    return status === "disciplined"
      ? "Allah is pleased with your dedication. Keep going strong!"
      : "Every day is a new chance. Make tawbah and start again.";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold text-foreground">
            {getTitle()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 p-4">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">{getMessage()}</p>
          </div>

          <div className="bg-accent/50 p-4 rounded-lg border border-border">
            <p className="text-foreground text-base leading-relaxed mb-3 text-center italic">
              "{randomVerse.text}"
            </p>
            <p className="text-primary text-sm font-medium text-center">
              — {randomVerse.reference}
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {status === "disciplined" 
                ? "Keep this momentum going, akhi! 💪" 
                : "Tomorrow is a fresh start. You got this! 🌟"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
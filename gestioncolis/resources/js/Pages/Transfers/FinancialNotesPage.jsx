import { Inertia } from '@inertiajs/inertia';
import FinancialNotesForm from '@/components/FinancialNotesForm';
import { usePage } from '@inertiajs/inertia-react';

const FinancialNotesPage = () => {
  const { props } = usePage();
  const [notes, setNotes] = useState(props.notes);
  
  const handleSaveNotes = (updatedNotes) => {
    Inertia.put(`/financial-notes/${updatedNotes.id}`, updatedNotes, {
      onSuccess: (page) => setNotes(page.props.notes),
      onError: (errors) => console.error(errors),
    });
  };

  return <FinancialNotesForm notes={notes} onSave={handleSaveNotes} />;
};

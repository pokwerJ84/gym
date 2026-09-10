/* Gym Tracker v141 — completed set delete button on the left */
(()=>{
  const enhanceSavedSetRows=()=>{
    document.querySelectorAll('.saved-set-row').forEach(row=>{
      const actions=row.querySelector('.saved-set-actions');
      const deleteBtn=actions?.querySelector('.delete-set-btn');
      const number=row.querySelector('.saved-set-number');
      if(!deleteBtn||!number||deleteBtn.classList.contains('saved-set-left-delete'))return;

      deleteBtn.classList.add('saved-set-left-delete');
      deleteBtn.textContent='×';
      deleteBtn.setAttribute('aria-label',(window.lang?.()==='cs')?'Smazat sérii':'Delete set');
      deleteBtn.setAttribute('title',(window.lang?.()==='cs')?'Smazat sérii':'Delete set');
      number.replaceWith(deleteBtn);
    });
  };

  const observer=new MutationObserver(enhanceSavedSetRows);
  const start=()=>{
    enhanceSavedSetRows();
    observer.observe(document.body,{childList:true,subtree:true});
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();

from django.conf.urls.defaults import *#patterns, include, url

from catissue import settings
from django.views.generic.simple import direct_to_template
from django.contrib import auth

urlpatterns = patterns('',
    (r'^$','tissue.views.index'),
    (r'^collection/$','tissue.collection.CollectionInit'),
    (r'^collection/fresh/$','tissue.collection.collection'),
    (r'^collection/save/$','tissue.collection.coll_save'),
    (r'^collection/save/createPDF$','tissue.collection.createPDF'),
    (r'^collection/save/createCSV$','tissue.collection.createCSV'),
    (r'^collection/err/$','tissue.collection.CollErr'),
    (r'^collection/param/$','tissue.collection.CollParam'),
    (r'^line/newCollection$','tissue.collection.CellLineNewCollection'),
    (r'^line/save/$','tissue.collection.CellLineSave'),
    (r'^batch/start/$','tissue.collection.BatchStart'),
    (r'^batch/collection/$','tissue.collection.BatchCollection'),
    (r'^batch/archivecollection/$','tissue.collection.BatchArchiveCollection'),
    (r'^batch/save/$','tissue.collection.BatchCollectionSave'),
    (r'^batch/save/final/$','tissue.collection.BatchCollectionSaveFinal'),
    
    (r'^ajax/drug/autocomplete/$','tissue.collection.ajaxDrugAutocomplete'),
    (r'^derived/$','tissue.derived.DerivedAliquotsView'),
    (r'^derived/select/$','tissue.derived.DerivedAliquotsSelect'),
    (r'^derived/insert/$','tissue.derived.InsertDerivedAliquots'),
    (r'^derived/insert/final/$','tissue.derived.InsertDerivedAliquotsFinal'),
    (r'^ajax/derived/autocomplete/$','tissue.derived.ajax_derived_autocomplete'),
    (r'^derived/execute/$','tissue.derived.ExecDerivedAliquots'),
    (r'^derived/execute/effective/$','tissue.derived.ExecEffectiveDerivedAliquots'),
    (r'^derived/execute/measure/$','tissue.derived.DerivedAliquotsMeasure'),
    (r'^derived/execute/measure/save/$','tissue.derived.DerivedAliquotsMeasureSave'),
    (r'^derived/execute/measure/view/$','tissue.derived.DerivedAliquotsMeasureView'),
    (r'^derived/execute/measureallaliquots/$','tissue.derived.DerivedAliquotsMeasureAllAliquots'),
    (r'^derived/execute/measure/insertfile/$','tissue.derived.DerivedAliquotsInsertMeasureFile'),
    (r'^derived/execute/confirm_details/$','tissue.derived.ConfirmDetailsDerivedAliquots'),
    (r'^derived/execute/part2details/$','tissue.derived.DetailsDerivedAliquots2'),
    (r'^derived/execute/loadkit$','tissue.derived.LoadKitDerivedAliquots'),
    (r'^derived/execute/savekit$','tissue.derived.SaveKitDerivedAliquots'),
    (r'^derived/execute/loaddetailspart2/$','tissue.derived.LoadDetailsDerivedAliquots2'),
    (r'^derived/execute/loadlastpart/$','tissue.derived.LoadLastPartDerivedAliquots'),
    (r'^derived/execute/last/$','tissue.derived.LastPartDerivedAliquots'),
    (r'^derived/robot/loadstep1/$','tissue.derivation_robot.LoadStep1'),
    (r'^derived/robot/loadstepkit/$','tissue.derivation_robot.LoadStepKit'),
    (r'^derived/robot/measure/$','tissue.derivation_robot.LoadInsertMeasure'),
    (r'^derived/robot/savemeasurephase1/$','tissue.derivation_robot.SaveMeasurePhase1'),
    (r'^derived/robot/loadcreatealiquot/$','tissue.derivation_robot.LoadCreateAliquot'),
    (r'^derived/robot/writealiquotdbrobot/$','tissue.derivation_robot.WriteAliquotDBRobot'),
    (r'^derived/robot/createderivatives/$','tissue.derivation_robot.CreateDerivatives'),
    (r'^derived/createPDF$','tissue.derived.createPDFDerivedAl'),
    (r'^derived/createCSV$','tissue.derived.createCSVDerivedAl'),
    (r'^derived/changevolume/$','tissue.derived.DerivedAliquotsChangeVolume'),
    (r'^derived/reschedule/$','tissue.derived.DerivedAliquotsReschedule'),
    (r'^derived/calculate/$','tissue.derived.DerivedAliquotsCalculateValues'),
    (r'^derived/protocol/$','tissue.derived.saveProtocols'),
    
    (r'^extern/$','tissue.collection.ExternAliquots'),
    (r'^extern/newcollection/$','tissue.collection.ExternAliquotsNewCollection'),
    (r'^extern/save/$','tissue.collection.SaveExternAliquots'),
    (r'^extern/save/createPDF$','tissue.collection.createPDFExtern'),
    (r'^extern/save/createCSV$','tissue.collection.createCSVExtern'),        
    
    (r'^explants/$','tissue.views.saveExplants'),
    (r'^explants/end/$','tissue.views.DeleteExplants'),
    
    (r'^kit/kittype$','tissue.kit.SaveKitType'),
    (r'^kit/singlekit$','tissue.kit.SaveSingleKit'),
    (r'^kit/final/kit$','tissue.kit.SaveFinalSingleKit'),
    #(r'^kit/final/createPDF$','tissue.kit.createPDFKit'),
    #(r'^kit/final/createCSV$','tissue.kit.createCSVKit'),
    
    (r'^logout/$','tissue.views.logout'),
#    (r'^login/$', 'django.contrib.auth.views.login', {'template_name': 'tissue2/login.html'}),
    (r'^login/$', 'tissue.views.login'),
    (r'^permission/$',direct_to_template,{'template':'tissue2/permission.html'}),
    #(r'^place/$','tissue.views.place'),    
    #(r'^register/$','register'),
    #(r'^register/success$','RegisterSuccess'),
    (r'^revalue/$','tissue.revalue.RevalueAliquotsView'),
    (r'^revalue/insert/$','tissue.revalue.InsertRevalueAliquots'),
    (r'^ajax/revalue/autocomplete/$','tissue.revalue.ajax_revalued_autocomplete'),
    (r'^ajax/revalue/newmeasuretype/autocomplete/$','tissue.revalue.AjaxRevaluedNewMeasureTypeAutocomplete'),
    (r'^ajax/revalue/newmeasureunit/autocomplete/$','tissue.revalue.AjaxRevaluedNewMeasureUnitAutocomplete'),
    (r'^revalue/execute/$','tissue.revalue.ExecRevalueAliquots'),
    (r'^revalue/execute/effective/$','tissue.revalue.ExecEffectiveRevalueAliquots'),
    #(r'^revalue/execute/details/$','tissue.revalue.ExecDetailsRevaluedAliquots'),
    (r'^revalue/execute/confirm_details/$','tissue.revalue.ConfirmDetailsRevaluedAliquots'),
    (r'^revalue/canc/$','tissue.revalue.CancRevalueAliquots'),
    (r'^revalue/viewfile/$','tissue.revalue.RevalueAliquotsViewFile'),
    (r'^revalue/robot/loadvalidate/$','tissue.revalue_robot.LoadValidateAliquot'),
    (r'^revalue/robot/planquantification/$','tissue.revalue_robot.PlanQuantification'),
    (r'^revalue/robot/savedata/$','tissue.revalue_robot.SaveData'),
    (r'^vital/$','tissue.position.VitalView'),
    (r'^ajax/position/autocomplete/$','tissue.position.ajax_position_autocomplete'),
    (r'^vital/insert/$','tissue.position.InsertPositionVitalAliquots'),
    (r'^vital/canc/$','tissue.position.CancVitalAliquots'),
    (r'^vital/execute/$','tissue.position.ExecPositionVitalAliquots'),
    (r'^vital/execute/effective/$','tissue.position.ExecEffectivePositionVitalAliquots'),
    (r'^vital/execute/confirm_details/$','tissue.position.ConfirmDetailsPositionVitalAliquots'),
    #(r'^vital/createPDF$','tissue.position.createPDFPositionAl'),
    #(r'^vital/createCSV$','tissue.position.createCSVPositionAl'),
    (r'^split/$','tissue.split.SplitAliquotsView'),
    (r'^split/insert/$','tissue.split.InsertSplitAliquots'),
    (r'^split/canc/$','tissue.split.CancSplitAliquots'),
    (r'^split/execute/$','tissue.split.ExecSplitAliquots'),
    (r'^split/execute/effective/$','tissue.split.ExecEffectiveSplitAliquots'),
    (r'^split/execute/last/$','tissue.split.LastPartSplitAliquots'),
    #(r'^split/createPDF$','tissue.split.createPDFSplitAl'),
    #(r'^split/createCSV$','tissue.split.createCSVSplitAl'),
    (r'^split/robot/loadvalidate/$','tissue.split_robot.LoadValidateAliquot'),
    (r'^split/robot/plandilution/$','tissue.split_robot.PlanDilution'),
    (r'^split/robot/savedata/$','tissue.split_robot.SaveData'),
    (r'^decrease/$','tissue.experiment.DecreaseView'),
    (r'^decrease/final$','tissue.experiment.DecreaseFinal'),
    (r'^decrease/insertfiles$','tissue.experiment.InsertFiles'),
    (r'^decrease/insertfiles/final$','tissue.experiment.InsertFilesFinal'),
    (r'^decrease/download/init$','tissue.experiment.DownloadInit'),
    (r'^decrease/download/rasdata$','tissue.experiment.DownloadRAS'),
    (r'^decrease/download/ecddata$','tissue.experiment.DownloadECD'),
    (r'^decrease/download/final/$','tissue.experiment.DownloadFilesFinal'),
    (r'^decrease/micro$','tissue.experiment.DecreaseViewMicro'),
    (r'^decrease/canc$','tissue.experiment.DecreaseCanc'),
    (r'^decrease/createPDF$','tissue.experiment.createPDFDecreaseVol'),
    (r'^decrease/createCSV$','tissue.experiment.createCSVDecreaseVol'),
    (r'^patient/$','tissue.patient.PatientView'),
    (r'^patient/createPDF$','tissue.patient.createPDFPatient'),
    (r'^patient/createCSV$','tissue.patient.createCSVPatient'),
    (r'^patient/export$','tissue.patient.PatientExport'),
    (r'^transfer/insert/$','tissue.transfer.InsertTransferAliquots'),
    (r'^transfer/insert/final/$','tissue.transfer.InsertTransferAliquotsFinal'),
    (r'^transfer/pending/$','tissue.transfer.PendingTransferAliquots'),
    (r'^transfer/send/$','tissue.transfer.SendTransferAliquots'),
    (r'^transfer/receive/$','tissue.transfer.ReceiveTransferAliquots'),
    (r'^transfer/receivefinal/$','tissue.transfer.ReceiveFinalTransferAliquots'),
    #(r'^transfer/createPDF/$','tissue.transfer.createPDFTransfer'),
    #(r'^transfer/createCSV/$','tissue.transfer.createCSVTransfer'),
    (r'^slide/insert/$','tissue.slide.InsertSlideAliquots'),
    (r'^slide/insert/final/$','tissue.slide.InsertSlideAliquotsFinal'),
    (r'^slide/choose/$','tissue.slide.ChooseSlideAliquots'),
    (r'^slide/execute/effective/$','tissue.slide.ExecEffectiveSlideAliquots'),
    (r'^slide/execute/last/$','tissue.slide.LastPartSlideAliquots'),
    (r'^parameters/add/$','tissue.collection.AddParameters'),
    (r'^parameters/save/$','tissue.collection.SaveParameters'),
    (r'^label/insert/$','tissue.label.InsertLabelAliquots'),
    (r'^label/insert/final/$','tissue.label.InsertLabelAliquotsFinal'),
    (r'^label/execute/$','tissue.label.ConvalidateLabelAliquots'),
    (r'^label/canc/$','tissue.label.CancLabelAliquots'),
    (r'^label/execute/effective/$','tissue.label.ExecEffectiveLabelAliquots'),
    (r'^label/execute/save/$','tissue.label.SaveLabelAliquots'),
    (r'^label/protocol/$','tissue.label.DefineLabelProtocol'),
    (r'^label/newMarker/$','tissue.label.NewMarker'),
    (r'^label/newProbe/$','tissue.label.NewProbe'),
    (r'^label/searchProbe/$','tissue.label.SearchProbe'),
    (r'^ajax/label/producer/autocomplete/$','tissue.label.AjaxLabelProducerAutocomplete'),
    (r'^label/insert/file/$','tissue.label.InsertFile'),
    (r'^label/save/file/$','tissue.label.SaveFile'),
    (r'^label/save/final/$','tissue.label.SaveFileFinal'),
    (r'^label/download/init/$','tissue.label.DownloadFileInit'),
    (r'^label/download/final/$','tissue.label.DownloadFileFinal'),
    (r'^label/delete/file/$','tissue.label.DeleteFile'),
    (r'^label/delete/filefinal/$','tissue.label.DeleteFileFinal'),
    (r'^label/view/gallery/$','tissue.label.ViewGallery'),
    #(r'^label/experiment/result/$','tissue.label.AnalysisResult'),
    #(r'^label/experiment/save/$','tissue.label.ResultSave'),
    #(r'^label/experiment/insertFile/$','tissue.label.InsertExperimentResultFile'),
    
    (r'^storevital/$','tissue.views.StoreVitalAliquots'),
    (r'^storevital/canc/$','tissue.views.StoreVitalAliquotsCanc'),
    (r'^store/archivedate/$','tissue.views.StoreArchiveDate'),
    
    (r'^aliquot/notavailable/$','tissue.fingerPrinting.NotAvailable'),

    #(r'^ajax/hospital/autocomplete/$','tissue.views.ajax_hospital_autocomplete'),
    #(r'^caxeno/$','tissue.views.caxeno'),
    
    (r'^query/$','tissue.views.Query'),
    
    (r'^prova/canc$','tissue.views.ProvaCanc'),
    (r'^prova/experiment$','tissue.views.ProvaExperiment'),
    (r'^prova/funnel$','tissue.views.ProvaFunnel'),
    
    (r'^derivationevent/copy/$','tissue.historic.CopyDerivationEvent'),
    (r'^change/mouse/$','tissue.historic.ChangeMouse'),
    (r'^measuredate/copy/$','tissue.historic.MeasureDateCopy'),
    (r'^hub/create/$','tissue.historic.HubCreate'),
    (r'^update/volume/$','tissue.views.UpdateVolume'),
    
    (r'^tissueAdmin/start/$','tissue.tissueAdmin.start'),
    
    (r'^change/collection$','tissue.historic.ChangeCollection'),
    (r'^change/datesampling$','tissue.historic.ChangeDateSampling'),
    (r'^historic/$','tissue.historic.Historic'),
    (r'^historic/sampling$','tissue.historic.HistoricSamplingEvent'),
    (r'^historic/tissue$','tissue.historic.HistoricTissue'),
    (r'^historic/crl/tissue$','tissue.historic.HistoricTissueCRL'),
    (r'^historic/xeno$','tissue.historic.HistoricXeno'),
    (r'^historic/explants$','tissue.historic.HistoricExplants'),
    (r'^historic/implants$','tissue.historic.HistoricImplants'),
    (r'^historic/savealiquotimplants$','tissue.historic.HistoricSaveAliquotImplants'),
    (r'^historic/derived$','tissue.historic.HistoricDerived'),
    (r'^historic/derived/duplicate$','tissue.historic.HistoricDerivedDuplicate'),
    (r'^historic/derived/container$','tissue.historic.HistoricDerivedContainer'),
    (r'^historic/mice/derived$','tissue.historic.HistoricMiceDerived'),
    
    (r'^historic/beamingtissue$','tissue.historic.HistoricBeamingTissue'),
    (r'^historic/beamingderived$','tissue.historic.HistoricBeamingDerived'),
    (r'^historic/ffpetissue$','tissue.historic.HistoricFFPETissue'),
    
    (r'^historic/cell/line$','tissue.historic.HistoricCellLine'),
    (r'^historic/cell/luraghi$','tissue.historic.HistoricCellLuraghi'),
    (r'^historic/cell/share$','tissue.historic.HistoricCellShare'),
    
    (r'^cell/line/update$','tissue.historic.UpdateCellLine'),
    (r'^cell/line/new$','tissue.historic.NewCellLine'),
    (r'^cell/update/collection$','tissue.historic.CellUpdateCollection'),
    (r'^cell/change/vector$','tissue.historic.CellChangeVector'),
    (r'^cell/change/lineage$','tissue.historic.CellChangeLineage'),
    
    (r'^historic/changealiquot$','tissue.historic.HistoricChangeAliquot'),
    
    (r'^check/patientid$','tissue.historic.CheckPatientID'),
    (r'^save/patientid$','tissue.historic.SavePatientID'),
    
    (r'^canc/aliquot$','tissue.views.CancAliquot'),
    (r'^restore/aliquot$','tissue.views.RestoreAliquot'),
    (r'^pieces/aliquot$','tissue.views.ChangeAliquotPieces'),

    (r'^check/crna$','tissue.historic.CheckcRNA'),
    (r'^check/implant$','tissue.historic.CheckTopiImpiantati'),
    (r'^check/derivation$','tissue.historic.CheckDerivation'),    
    
    (r'^error/$','tissue.views.error'),

    (r'^listrestoredaliquots$','tissue.views.ListAliquotsToRestore'),
    (r'^listdeletedaliquots$','tissue.views.ListDeletedAliquots'),

)
if settings.DEBUG:
    urlpatterns += patterns('',
        (r'^tissue_media/(?P<path>.*)$', 'django.views.static.serve',  
         {'document_root':     settings.MEDIA_ROOT}),
    )



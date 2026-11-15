# Vídeo intersticial recompensado para antecipar testes

O botão aparece quando o bloqueio é apenas o intervalo de 30 minutos. O modal oferece Assistir e Cancelar e informa a recompensa: um teste. Falha, cancelamento ou anúncio sem recompensa não liberam testes.

## Integração Android

O app Android usa a ponte `KeepEnglishAds`, evento `keepEnglishRewardedInterstitial` e Google AdMob. A versão 2 da ponte inclui o identificador opaco da solicitação em `ServerSideVerificationOptions.customData`. O evento do aparelho não autoriza sozinho a recompensa no servidor.

Aplicação reproduzível da atualização no projeto companheiro:

```text
python scripts/configure-android-rewards.py --android-root CAMINHO_DO_PROJETO_ANDROID
```

A atualização eleva a versão Android de 1.0.1 (2) para 1.0.2 (3). O usuário precisa instalar o APK/AAB atualizado para usar a ponte com verificação de servidor. O projeto companheiro informado não possui diretório Git; a atualização reproduzível está versionada neste repositório.

## Configuração do AdMob e servidor

1. Substitua os IDs oficiais de teste em `app-config.properties` pelos IDs reais do seu app e blocos de anúncio, antes da distribuição de produção.
2. Configure `ADMOB_REWARDED_AD_UNIT_ID` no servidor com o identificador do bloco recebido em `ad_unit` no callback.
3. No bloco intersticial recompensado do AdMob, configure a URL de verificação de servidor: `https://keep-english.vercel.app/api/ads/admob/ssv`.
4. Publique a migração PostgreSQL incluída. O comando `vercel-build` já aplica migrações antes do build.
5. Valide um anúncio real no Android atualizado e o recebimento da confirmação assinada do Google. IDs de teste e testes com chaves locais não comprovam essa configuração externa.

O callback verifica assinatura ECDSA SHA-256 usando as chaves públicas do Google, o bloco permitido, data e identificador único de transação. A solicitação pertence à conta autenticada e ao último teste e vence ao terminar o intervalo normal. A recompensa é consumida uma única vez na mesma transação que grava o resultado do teste. Ela não dispensa palavras salvas nem meta concluída. Solicitações e recompensas são apagadas em cascata na exclusão da conta.

Se a confirmação demorar, o app mostra uma mensagem e mantém o intervalo normal. Uma confirmação posterior ainda pode ser consultada enquanto a solicitação estiver válida. Nenhum vídeo fictício ou clique isolado libera acesso.

## Privacidade e classificação

Fonte única de privacidade e termos: `src/features/auth/content/legal-documents.json`. Classificação informada pelo responsável: Livre no Brasil. Isso não substitui a declaração de público-alvo na Play Console nem os cuidados aplicáveis a crianças e adolescentes. Nenhuma configuração infantil ou de consentimento foi presumida a partir da classificação.

Fontes oficiais consultadas em 15/11/2026:

- https://developers.google.com/admob/android/ssv
- https://developers.google.com/admob/android/privacy/play-data-disclosure
- https://support.google.com/googleplay/android-developer/answer/9898843
- https://support.google.com/googleplay/android-developer/answer/9867159
